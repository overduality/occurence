import type { DatabaseSync } from "node:sqlite";
import { extractTasksFromDoc } from "@/lib/ai";
import { getWorkspaceSnapshot } from "@/lib/db";
import type { Doc } from "@/types/outterring";

export const MAX_ACTIVE_RUNWAY = 5;

export async function handleDocSlice(
  db: DatabaseSync,
  {
    docId,
    title,
    content,
  }: {
    docId?: string;
    title?: string;
    content?: string;
  }
) {
  let docTitle = typeof title === "string" ? title : "";
  let docContent = typeof content === "string" ? content : "";

  if (docId) {
    const existingDoc = db.prepare("SELECT * FROM docs WHERE id = ?").get(docId) as Doc | undefined;
    if (!existingDoc) {
      return { error: "Document not found", status: 404 };
    }
    docTitle = existingDoc.title;
    docContent = existingDoc.content;
  }

  if (!docTitle && !docContent) {
    return { error: "Document content required", status: 400 };
  }

  const { activeSteps, parkedSteps } = await extractTasksFromDoc(docTitle, docContent);
  const now = Date.now();

  db.exec("BEGIN IMMEDIATE");
  try {
    const activeRow = db
      .prepare("SELECT count(*) as c FROM tasks WHERE status = 'in_progress'")
      .get() as { c: number };
    const runwayRow = db
      .prepare("SELECT count(*) as c FROM tasks WHERE status IN ('in_progress', 'todo')")
      .get() as { c: number };

    let hasActive = activeRow.c > 0;
    let runwayCount = runwayRow.c;

    const insertTask = db.prepare(`
      INSERT INTO tasks (
        id, title, description, status, priority, estimated_minutes,
        why_it_matters, kickstart_action, kickstart_completed, sprint_id,
        order_idx, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL, ?, ?, ?)
    `);

    activeSteps.forEach((step, idx) => {
      const id = `task-${now}-doc-${idx}-${Math.random().toString(36).slice(2, 5)}`;
      let status: "in_progress" | "todo" | "backlog" = "todo";
      if (!hasActive && idx === 0) {
        status = "in_progress";
        hasActive = true;
        runwayCount += 1;
      } else if (runwayCount < MAX_ACTIVE_RUNWAY) {
        status = "todo";
        runwayCount += 1;
      } else {
        status = "backlog";
      }

      insertTask.run(
        id,
        step.title,
        step.description,
        status,
        step.priority,
        step.estimatedMinutes,
        step.whyItMatters,
        step.kickstartAction,
        idx,
        now - idx,
        now - idx
      );
    });

    parkedSteps.forEach((step, idx) => {
      const id = `task-${now}-docpark-${idx}-${Math.random().toString(36).slice(2, 5)}`;
      insertTask.run(
        id,
        step.title,
        step.description,
        "backlog",
        step.priority,
        step.estimatedMinutes,
        step.whyItMatters,
        step.kickstartAction,
        idx,
        now - 50 - idx,
        now - 50 - idx
      );
    });

    db.exec("COMMIT");
  } catch (txErr) {
    db.exec("ROLLBACK");
    throw txErr;
  }

  const snapshot = getWorkspaceSnapshot();
  return {
    data: {
      extractedCount: activeSteps.length + parkedSteps.length,
      snapshot,
    },
  };
}
