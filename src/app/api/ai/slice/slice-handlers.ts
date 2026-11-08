import type { DatabaseSync } from "node:sqlite";
import { sliceExistingTask } from "@/lib/ai";
import { getWorkspaceSnapshot } from "@/lib/db";
import type { Task } from "@/types/outterring";
import { MAX_ACTIVE_RUNWAY } from "./doc-slice-handler";

export { handleDocSlice } from "./doc-slice-handler";

export async function handleTaskSlice(db: DatabaseSync, taskId: string) {
  const existingTask = db.prepare("SELECT * FROM tasks WHERE id = ?").get(taskId) as Task | undefined;
  if (!existingTask) {
    return { error: "Task not found", status: 404 };
  }

  const slices = await sliceExistingTask(existingTask.title, existingTask.description);
  const firstSlice = slices[0];
  const followUpSlices = slices.slice(1);
  const now = Date.now();

  db.exec("BEGIN IMMEDIATE");
  try {
    // Morph current task into Step 1 so the user stays anchored without jarring card deletion
    db.prepare(`
      UPDATE tasks SET
        title = ?,
        description = ?,
        estimated_minutes = ?,
        kickstart_action = ?,
        kickstart_completed = 0,
        updated_at = ?
      WHERE id = ?
    `).run(
      firstSlice.title,
      firstSlice.description,
      firstSlice.estimatedMinutes,
      firstSlice.kickstartAction,
      now,
      existingTask.id
    );

    db.prepare("DELETE FROM subtasks WHERE task_id = ?").run(existingTask.id);
    const insertSub = db.prepare(`
      INSERT INTO subtasks (id, task_id, title, is_completed, order_idx)
      VALUES (?, ?, ?, 0, ?)
    `);
    firstSlice.subtasks.forEach((st, idx) => {
      insertSub.run(`sub-${now}-0-${idx}`, existingTask.id, st, idx);
    });

    const runwayRow = db
      .prepare("SELECT count(*) as c FROM tasks WHERE status IN ('in_progress', 'todo')")
      .get() as { c: number };
    let runwayCount = runwayRow.c;

    const insertTask = db.prepare(`
      INSERT INTO tasks (
        id, title, description, status, priority, estimated_minutes,
        why_it_matters, kickstart_action, kickstart_completed, sprint_id,
        order_idx, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
    `);

    followUpSlices.forEach((slice, idx) => {
      const nextId = `task-${now}-slice-${idx}-${Math.random().toString(36).slice(2, 5)}`;
      const status = runwayCount < MAX_ACTIVE_RUNWAY ? "todo" : "backlog";
      if (status === "todo") runwayCount += 1;

      insertTask.run(
        nextId,
        slice.title,
        slice.description,
        status,
        existingTask.priority,
        slice.estimatedMinutes,
        slice.whyItMatters,
        slice.kickstartAction,
        existingTask.sprint_id,
        idx,
        now - idx - 1,
        now - idx - 1
      );

      slice.subtasks.forEach((st, sIdx) => {
        insertSub.run(`sub-${now}-${idx + 1}-${sIdx}`, nextId, st, sIdx);
      });
    });

    db.exec("COMMIT");
  } catch (txErr) {
    db.exec("ROLLBACK");
    throw txErr;
  }

  const snapshot = getWorkspaceSnapshot();
  return {
    data: {
      slicedCount: slices.length,
      snapshot,
    },
  };
}
