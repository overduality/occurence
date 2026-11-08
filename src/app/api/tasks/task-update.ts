import type { DatabaseSync } from "node:sqlite";
import { getWorkspaceSnapshot, recordDailyProgress } from "@/lib/db";
import type { Task, TaskPriority, TaskStatus } from "@/types/outterring";

export interface PatchTaskInput {
  id?: string;
  status?: TaskStatus;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  estimated_minutes?: number;
  why_it_matters?: string;
  kickstart_action?: string;
  kickstart_completed?: number;
  sprint_id?: string | null;
  order_idx?: number;
  add_focus_minutes?: number;
  autoPromoteNext?: boolean;
}

export function updateTaskEntry(db: DatabaseSync, body: PatchTaskInput) {
  const {
    id,
    status,
    title,
    description,
    priority,
    estimated_minutes,
    why_it_matters,
    kickstart_action,
    kickstart_completed,
    sprint_id,
    order_idx,
    add_focus_minutes,
    autoPromoteNext = true,
  } = body;

  if (typeof add_focus_minutes === "number" && add_focus_minutes > 0 && !id) {
    const todayMetrics = recordDailyProgress(db, 0, Math.round(add_focus_minutes));
    return { data: { todayMetrics } };
  }

  if (!id || typeof id !== "string") {
    return { error: "Task ID is required", status: 400 };
  }

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id) as Task | undefined;
  if (!existing) {
    return { error: "Task not found", status: 404 };
  }

  const now = Date.now();
  let promotedTaskId: string | null = null;
  const hasSprintPatch = Object.prototype.hasOwnProperty.call(body, "sprint_id");

  db.exec("BEGIN IMMEDIATE");
  try {
    // Rule of ONE: activating a task demotes any other active task cleanly back to todo
    if (status === "in_progress" && existing.status !== "in_progress") {
      db.prepare(`
        UPDATE tasks
        SET status = 'todo', order_idx = 0, updated_at = ?
        WHERE status = 'in_progress' AND id != ?
      `).run(now, id);
    }

    const nextCompletedAt =
      status === "done"
        ? now
        : status && status !== "done"
          ? null
          : existing.completed_at;

    const nextSprintId = hasSprintPatch ? (sprint_id || null) : existing.sprint_id;

    db.prepare(`
      UPDATE tasks SET 
        status = COALESCE(?, status),
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        priority = COALESCE(?, priority),
        estimated_minutes = COALESCE(?, estimated_minutes),
        why_it_matters = COALESCE(?, why_it_matters),
        kickstart_action = COALESCE(?, kickstart_action),
        kickstart_completed = COALESCE(?, kickstart_completed),
        sprint_id = ?,
        order_idx = COALESCE(?, order_idx),
        completed_at = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      status ?? null,
      typeof title === "string" && title.trim() ? title.trim() : null,
      typeof description === "string" ? description : null,
      priority ?? null,
      typeof estimated_minutes === "number" ? estimated_minutes : null,
      typeof why_it_matters === "string" ? why_it_matters : null,
      typeof kickstart_action === "string" ? kickstart_action : null,
      typeof kickstart_completed === "number" ? kickstart_completed : null,
      nextSprintId,
      typeof order_idx === "number" ? order_idx : null,
      nextCompletedAt,
      now,
      id
    );

    if (typeof add_focus_minutes === "number" && add_focus_minutes > 0) {
      recordDailyProgress(db, 0, Math.round(add_focus_minutes));
    }

    // Update daily metrics on completion transitions
    if (status === "done" && existing.status !== "done") {
      recordDailyProgress(db, 1, existing.estimated_minutes || 10);

      if (autoPromoteNext) {
        const activeCheck = db
          .prepare("SELECT id FROM tasks WHERE status = 'in_progress' LIMIT 1")
          .get() as { id: string } | undefined;

        if (!activeCheck) {
          const nextTodo = db
            .prepare(`
              SELECT id FROM tasks
              WHERE status = 'todo'
              ORDER BY order_idx ASC, updated_at DESC
              LIMIT 1
            `)
            .get() as { id: string } | undefined;

          if (nextTodo) {
            db.prepare("UPDATE tasks SET status = 'in_progress', updated_at = ? WHERE id = ?").run(
              now,
              nextTodo.id
            );
            promotedTaskId = nextTodo.id;
          }
        }
      }
    } else if (status && status !== "done" && existing.status === "done") {
      recordDailyProgress(db, -1, -(existing.estimated_minutes || 10));
    }

    db.exec("COMMIT");
  } catch (txErr) {
    db.exec("ROLLBACK");
    throw txErr;
  }

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  const snapshot = getWorkspaceSnapshot();
  return {
    data: {
      updated,
      promotedTaskId,
      todayMetrics: snapshot.todayMetrics,
      tasks: snapshot.tasks,
    },
  };
}
