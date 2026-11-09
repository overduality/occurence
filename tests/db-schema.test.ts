import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { initSchema } from "@/lib/db/schema";

describe("SQLite Database Engine & Schema", () => {
  it("initializes SQLite schema correctly in memory", () => {
    const db = new DatabaseSync(":memory:");
    initSchema(db);

    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
      .all() as Array<{ name: string }>;

    const tableNames = tables.map((t) => t.name);
    expect(tableNames).toContain("tasks");
    expect(tableNames).toContain("subtasks");
    expect(tableNames).toContain("sprints");
    expect(tableNames).toContain("docs");
    expect(tableNames).toContain("kanban_columns");
    expect(tableNames).toContain("daily_metrics");
    db.close();
  });

  it("seeds initial data and ensures only 1 task is in_progress (Rule of ONE)", () => {
    const db = new DatabaseSync(":memory:");
    initSchema(db);

    const activeTasks = db
      .prepare("SELECT * FROM tasks WHERE status = 'in_progress'")
      .all();

    // Rule of ONE invariant: exactly 1 active task maximum
    expect(activeTasks.length).toBe(1);

    const totalTasks = db
      .prepare("SELECT count(*) as count FROM tasks")
      .get() as { count: number };
    expect(totalTasks.count).toBeGreaterThan(0);

    const columns = db
      .prepare("SELECT * FROM kanban_columns ORDER BY order_idx ASC")
      .all();
    expect(columns.length).toBeGreaterThanOrEqual(4);

    db.close();
  });
});
