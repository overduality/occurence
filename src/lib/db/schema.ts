import type { DatabaseSync } from "node:sqlite";
import { DEFAULT_COLUMNS } from "./constants";
import { seedStarterData } from "./seed";

export function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sprints (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      goal TEXT DEFAULT '',
      status TEXT DEFAULT 'active',
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      estimated_minutes INTEGER DEFAULT 15,
      why_it_matters TEXT DEFAULT '',
      kickstart_action TEXT DEFAULT '',
      kickstart_completed INTEGER DEFAULT 0,
      sprint_id TEXT,
      order_idx INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      order_idx INTEGER DEFAULT 0,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS docs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT DEFAULT '',
      category TEXT DEFAULT 'general',
      tags TEXT DEFAULT '[]',
      is_pinned INTEGER DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS daily_metrics (
      date TEXT PRIMARY KEY,
      tasks_completed INTEGER DEFAULT 0,
      focus_minutes INTEGER DEFAULT 0,
      daily_summary TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS kanban_columns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      order_idx INTEGER NOT NULL,
      wip_limit INTEGER,
      is_system INTEGER DEFAULT 0,
      color TEXT DEFAULT 'accent'
    );

    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
    CREATE INDEX IF NOT EXISTS idx_docs_pinned ON docs(is_pinned);
    CREATE INDEX IF NOT EXISTS idx_columns_order ON kanban_columns(order_idx);
  `);

  // Initialize default kanban columns if not yet populated
  const colCount = (db.prepare("SELECT count(*) as count FROM kanban_columns").get() as { count: number }).count;
  if (colCount === 0) {
    const insertCol = db.prepare(`
      INSERT INTO kanban_columns (id, title, order_idx, wip_limit, is_system, color)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    DEFAULT_COLUMNS.forEach((col) => {
      insertCol.run(col.id, col.title, col.order_idx, col.wip_limit ?? null, col.is_system ?? 0, col.color ?? "accent");
    });
  }

  // Safe column migrations for pre-existing databases
  const columns = db.prepare("PRAGMA table_info(tasks)").all() as Array<{ name: string }>;
  const colNames = new Set(columns.map((c) => c.name));
  if (!colNames.has("kickstart_completed")) {
    db.exec("ALTER TABLE tasks ADD COLUMN kickstart_completed INTEGER DEFAULT 0;");
  }
  if (!colNames.has("sprint_id")) {
    db.exec("ALTER TABLE tasks ADD COLUMN sprint_id TEXT;");
  }

  const countRow = db.prepare("SELECT count(*) as count FROM tasks").get() as { count: number };
  if (countRow.count === 0) {
    seedStarterData(db);
  }
}
