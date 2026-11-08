import type { DatabaseSync } from "node:sqlite";
import { deriveKickstart, ensurePhysicalVerb } from "@/lib/ai";
import type { TaskPriority, TaskStatus } from "@/types/outterring";

export { type PatchTaskInput, updateTaskEntry } from "./task-update";

export interface CreateTaskInput {
  id?: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  estimated_minutes?: number;
  why_it_matters?: string;
  kickstart_action?: string;
  sprint_id?: string | null;
  subtasks?: string[];
  enforcePhysicalVerb?: boolean;
}

export function createTaskEntry(db: DatabaseSync, body: CreateTaskInput) {
  const {
    id: clientProvidedId,
    title,
    description = "",
    status = "todo",
    priority = "medium",
    estimated_minutes = 10,
    why_it_matters = "",
    kickstart_action = "",
    sprint_id = null,
    subtasks = [],
    enforcePhysicalVerb: enforceVerb = false,
  } = body;

  const finalTitle = enforceVerb ? ensurePhysicalVerb(title.trim()) : title.trim();
  const finalKickstart = kickstart_action?.trim() || deriveKickstart(finalTitle);
  const id =
    typeof clientProvidedId === "string" && clientProvidedId.startsWith("task-")
      ? clientProvidedId
      : `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const now = Date.now();

  db.exec("BEGIN IMMEDIATE");
  try {
    // Rule of ONE: only 1 task in_progress at any moment
    if (status === "in_progress") {
      db.prepare(`
        UPDATE tasks SET status = 'todo', updated_at = ?
        WHERE status = 'in_progress'
      `).run(now);
    }

    db.prepare(`
      INSERT INTO tasks (
        id, title, description, status, priority, estimated_minutes,
        why_it_matters, kickstart_action, kickstart_completed, sprint_id,
        order_idx, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, 0, ?, ?)
    `).run(
      id,
      finalTitle,
      description,
      status,
      priority,
      estimated_minutes,
      why_it_matters,
      finalKickstart,
      sprint_id,
      now,
      now
    );

    if (Array.isArray(subtasks) && subtasks.length > 0) {
      const insertSub = db.prepare(`
        INSERT INTO subtasks (id, task_id, title, is_completed, order_idx)
        VALUES (?, ?, ?, 0, ?)
      `);
      subtasks.forEach((st: string, idx: number) => {
        if (typeof st === "string" && st.trim()) {
          insertSub.run(`sub-${now}-${idx}-${Math.random().toString(36).slice(2, 5)}`, id, st.trim(), idx);
        }
      });
    }

    db.exec("COMMIT");
  } catch (txErr) {
    db.exec("ROLLBACK");
    throw txErr;
  }

  const created = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  const createdSubtasks = db.prepare("SELECT * FROM subtasks WHERE task_id = ? ORDER BY order_idx ASC").all(id);
  return { task: created, subtasks: createdSubtasks };
}

export function deleteTaskEntry(db: DatabaseSync, id: string | null, clearDone: boolean) {
  if (clearDone) {
    db.prepare("DELETE FROM tasks WHERE status = 'done'").run();
    return { success: true };
  }

  if (!id) {
    return { error: "Task ID is required", status: 400 };
  }

  db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  return { success: true };
}
