import type { Doc, KanbanColumn, Sprint, Subtask, Task, WorkspaceSnapshot } from "@/types/outterring";
import { getDatabase } from "./connection";
import { DEFAULT_COLUMNS } from "./constants";
import { getOrCreateTodayMetrics, toPlainRows } from "./metrics";

export function getWorkspaceSnapshot(): WorkspaceSnapshot {
  const db = getDatabase();

  // Safely migrate untouched default seed doc branding if still using previous project name
  db.prepare(`
    UPDATE docs
    SET
      title = REPLACE(title, 'Outterring', 'Occuring'),
      content = REPLACE(content, 'Outterring', 'Occuring')
    WHERE id = 'doc-1' AND title LIKE '%Outterring%'
  `).run();

  // Ensure standard onboarding user guide doc exists
  const guideCheck = db.prepare("SELECT id FROM docs WHERE id = 'doc-guide'").get();
  if (!guideCheck) {
    const guideContent = `# 📘 Complete Guide: How to Use Occuring

Welcome to **Occuring** — an instant-first personal management workspace and executive function co-pilot designed to eliminate friction, prevent overwhelm, and keep you anchored on your immediate next action.

---

## 1. The 3 Core Modes (Press \`1\`, \`2\`, \`3\`)

### 🎯 Focus HUD (\`1\`) — The Rule of ONE
- **Why it exists:** Executive dysfunction and ADHD paralysis often happen when staring at a sprawling backlog of 50 tasks.
- **How to use it:** The Focus HUD hides backlogs completely. You only see the **single active step** and its **2-Minute Kickstart**.
- **Key Actions:**
  - **Space**: Complete the active step and automatically advance the next queued step.
  - **E**: Inspect the issue, edit sub-checkpoints, change priority, or convert to a doc.
  - **Timer**: Choose \`2m\` (Kickstart), \`10m\`, or \`25m\` (Pomodoro). Focus minutes are automatically logged to your SQLite daily metrics.
  - **I'm Lost (\`G\`)**: Zero-guilt re-centering anchor that tells you in one calm sentence where you left off, with one 2-minute micro-action.

### 📋 Sprint Board (\`2\`) — Focused Kanban & WIP Limits
- **Micro-Sprints:** Work in short, bounded sprints (3–5 steps) with a clear definition of done.
- **How Sprints Work:**
  - Click **+ New Sprint** to create a sprint container and set it as **Active**.
  - Sprints group tasks together with a shared goal.
  - When starting a new sprint, you can check *"Move unfinished tasks"* to automatically carry over remaining To Do steps into the new sprint.
  - You can switch between active and completed sprints using the Sprint Switcher bar at the top of the board.
- **Columns:**
  - **In Progress:** Strictly limited to 1 active task.
  - **To Do:** Your active runway (up to 4 steps).
  - **Done:** Shipped steps. Click "Clear" to tidy up.
  - **Backlog:** Safe parking lot for overflow ideas so your working memory stays calm.

### 📝 Docs & Scratchpad (\`3\`) — Documentation & Task Extraction
- **Interactive Checklists:** Click \`- [ ]\` checkboxes in split or read mode to toggle \`- [x]\` directly in Markdown source!
- **1-Click Templates:** Create instant ADRs (Architecture Decision Records), Runbooks, or Meeting notes.
- **Extract Tasks:** Click **Extract Tasks** on any note to have the AI Micro-Slicer turn your note's checklist into actionable sprint steps on the board.

---

## 2. Global Quick Capture (\`⌘K\` or \`Ctrl+K\`)
Press \`⌘K\` from anywhere in the app:
- **Type any raw thought:** AI auto-triages it into a task, sprint, or note.
- **Prefixes:**
  - \`"Sprint: Billing refactor, add webhook tests, update env"\` → Creates a 3–5 step micro-sprint.
  - \`"Note: Database migration decisions"\` → Creates a documentation page.
- **Search:** Instantly jump to any task by title or issue key (e.g. \`OC-101\`), or open any doc.

---

## 3. Keyboard Shortcuts Reference
| Shortcut | Action |
| :--- | :--- |
| \`⌘K\` / \`Ctrl+K\` | Global Spotlight Quick Capture & Search |
| \`Space\` | Complete active Focus step & advance queue |
| \`E\` | Inspect & edit active step details |
| \`1\` | Switch to Focus HUD |
| \`2\` | Switch to Sprint Board |
| \`3\` | Switch to Docs & Notes |
| \`G\` | Emergency Re-center ("I'm Lost") |
| \`Esc\` | Dismiss modals and popovers |`;

    db.prepare(`
      INSERT INTO docs (id, title, content, category, tags, is_pinned, created_at, updated_at)
      VALUES ('doc-guide', '📘 Complete Guide: How to Use Occuring', ?, 'general', '["guide","onboarding"]', 1, ?, ?)
    `).run(guideContent, Date.now(), Date.now());
  }

  const tasks = toPlainRows<Task>(
    db
      .prepare(`
        SELECT * FROM tasks ORDER BY 
          CASE status 
            WHEN 'in_progress' THEN 1 
            WHEN 'todo' THEN 2 
            WHEN 'backlog' THEN 3 
            WHEN 'done' THEN 4 
            ELSE 5 
          END, 
          order_idx ASC, 
          updated_at DESC
      `)
      .all()
  );

  const subtasks = toPlainRows<Subtask>(
    db.prepare("SELECT * FROM subtasks ORDER BY order_idx ASC").all()
  );

  const sprints = toPlainRows<Sprint>(
    db.prepare("SELECT * FROM sprints ORDER BY created_at DESC").all()
  );

  const docs = toPlainRows<Doc>(
    db.prepare("SELECT * FROM docs ORDER BY is_pinned DESC, updated_at DESC").all()
  );

  const columns = toPlainRows<KanbanColumn>(
    db.prepare("SELECT * FROM kanban_columns ORDER BY order_idx ASC").all()
  );

  const todayMetrics = getOrCreateTodayMetrics(db);

  return {
    tasks,
    subtasks,
    sprints,
    docs,
    columns: columns.length > 0 ? columns : DEFAULT_COLUMNS,
    todayMetrics,
  };
}

export function getWalHealth() {
  const db = getDatabase();
  const journalRow = db.prepare("PRAGMA journal_mode").get() as { journal_mode: string };
  const syncRow = db.prepare("PRAGMA synchronous").get() as { synchronous: number };
  const taskCount = (db.prepare("SELECT count(*) as c FROM tasks").get() as { c: number }).c;
  const docCount = (db.prepare("SELECT count(*) as c FROM docs").get() as { c: number }).c;

  return {
    status: "healthy",
    journalMode: journalRow.journal_mode,
    synchronous: syncRow.synchronous,
    taskCount,
    docCount,
    dbPath: "data/outterring.db",
    timestamp: Date.now(),
  };
}
