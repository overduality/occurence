import type { DatabaseSync } from "node:sqlite";

export function seedStarterData(db: DatabaseSync) {
  const now = Date.now();
  const sprintId = "sprint-core-launch";

  db.prepare(`
    INSERT INTO sprints (id, title, goal, status, created_at)
    VALUES (?, ?, ?, 'active', ?)
  `).run(
    sprintId,
    "Core Auth & Deployment Sprint",
    "Ship resilient token refresh and self-hosted Docker deployment without context switching.",
    now
  );

  const insertTask = db.prepare(`
    INSERT INTO tasks (
      id, title, description, status, priority, estimated_minutes,
      why_it_matters, kickstart_action, kickstart_completed, sprint_id,
      order_idx, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
  `);

  // 1 Active Focus Step (Rule of ONE)
  insertTask.run(
    "task-1",
    "Open auth.ts and verify JWT expiry guard on token refresh",
    "Prevent 500 responses when expired refresh tokens hit the session endpoint.",
    "in_progress",
    "high",
    15,
    "Keeps active builder sessions alive without unexpected sign-outs.",
    "Open src/lib/auth.ts, jump to verifySessionToken(), and read the expiry check.",
    sprintId,
    0,
    now,
    now
  );

  const insertSub = db.prepare(`
    INSERT INTO subtasks (id, task_id, title, is_completed, order_idx)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertSub.run("sub-1", "task-1", "Open auth handler and inspect expired token branch", 1, 0);
  insertSub.run("sub-2", "task-1", "Write guard clause returning typed 401 refresh signal", 0, 1);
  insertSub.run("sub-3", "task-1", "Run unit test suite on token expiry edge case", 0, 2);

  // 2 Active Sprint Runway Steps (todo)
  insertTask.run(
    "task-2",
    "Write 3 bullet points documenting SQLite WAL backup runbook",
    "Capture exact .backup command and Docker volume snapshot path in Scratchpad.",
    "todo",
    "medium",
    10,
    "Ensures zero-anxiety self-hosted persistence before shipping.",
    "Open Scratchpad (press 3) and type the 3-line backup command block.",
    sprintId,
    1,
    now - 1000,
    now - 1000
  );

  insertTask.run(
    "task-3",
    "Run command docker compose config to validate volume mounts",
    "Confirm ./data:/app/data persists outterring.db, -wal, and -shm files cleanly.",
    "todo",
    "medium",
    10,
    "Verifies one-command self-hosting readiness.",
    "Open terminal in project root and run docker compose config.",
    sprintId,
    2,
    now - 2000,
    now - 2000
  );

  // Parked Future Runway (backlog - hidden from Focus HUD by default)
  insertTask.run(
    "task-4",
    "Sketch weekly focus velocity chart for personal retrospective",
    "Optional visual digest of daily_metrics shipped tasks and focus minutes.",
    "backlog",
    "low",
    15,
    "Provides calm end-of-week reflection without daily clutter.",
    "Open paper or Scratchpad and list the 2 metrics that actually matter.",
    null,
    0,
    now - 3000,
    now - 3000
  );

  insertTask.run(
    "task-5",
    "Configure automated nightly rsync for ./data SQLite snapshots",
    "Off-box backup cron job on personal VPS.",
    "backlog",
    "low",
    15,
    "Adds disaster recovery peace of mind for self-hosted data.",
    "Create scripts/backup-wal.sh and write the shebang line.",
    null,
    1,
    now - 4000,
    now - 4000
  );

  // Seed Scratchpad Docs
  const insertDoc = db.prepare(`
    INSERT INTO docs (id, title, content, category, tags, is_pinned, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDoc.run(
    "doc-1",
    "Architecture Blueprint: Occuring Zero-Friction Principles",
    `# Occuring Operating Principles

Occuring is built to eliminate executive friction and keep momentum anchored on the immediate physical action.

## 1. The Rule of ONE
- Never expose 30+ backlog items during execution.
- Surface **one active micro-step** (5-15 minutes) paired with a **2-Minute Kickstart**.
- Park overflow ideas safely in the Backlog until ready.

## 2. SQLite WAL Persistence
All reads and writes run locally against SQLite in Write-Ahead Logging mode:

\`\`\`sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA busy_timeout = 5000;
\`\`\`

## 3. Zero-Guilt Grounding
Whenever attention drifts, hit **I'm Lost**. No timers shaming idle gaps—just one calm sentence on where you left off and one 2-minute physical action to restart.`,
    "architecture",
    JSON.stringify(["core", "wal", "focus"]),
    1,
    now,
    now
  );

  insertDoc.run(
    "doc-2",
    "Runbook: Self-Hosting & Docker Volume Persistence",
    `# Self-Hosting Runbook

## Quick Start
Run the container in detached mode with persistent SQLite volume storage:

\`\`\`bash
docker compose up -d
\`\`\`

## Data Files
Mounted inside \`./data/\`:
- \`outterring.db\` - Primary relational store
- \`outterring.db-wal\` - Concurrent write-ahead log
- \`outterring.db-shm\` - Shared-memory index

## Next Actionable Ideas
- Open monitoring dashboard and verify /api/health returns WAL status
- Write 3 bullet points on reverse-proxy TLS config
- Run command curl -s http://localhost:5555/api/health`,
    "runbook",
    JSON.stringify(["docker", "ops", "sqlite"]),
    0,
    now - 5000,
    now - 5000
  );
}
