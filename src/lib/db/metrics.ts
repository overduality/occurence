import type { DatabaseSync } from "node:sqlite";
import type { DailyMetrics } from "@/types/outterring";

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * node:sqlite returns null-prototype objects ([Object: null prototype]).
 * React Server Components require standard Object.prototype plain objects when passing props to Client Components.
 */
export function toPlainRow<T>(row: unknown): T {
  return { ...(row as Record<string, unknown>) } as T;
}

export function toPlainRows<T>(rows: unknown[]): T[] {
  return rows.map((row) => ({ ...(row as Record<string, unknown>) }) as T);
}

export function getOrCreateTodayMetrics(db: DatabaseSync): DailyMetrics {
  const today = getTodayDateKey();
  const existing = db
    .prepare("SELECT * FROM daily_metrics WHERE date = ?")
    .get(today) as DailyMetrics | undefined;

  if (existing) return toPlainRow<DailyMetrics>(existing);

  db.prepare(`
    INSERT INTO daily_metrics (date, tasks_completed, focus_minutes, daily_summary)
    VALUES (?, 0, 0, '')
  `).run(today);

  return {
    date: today,
    tasks_completed: 0,
    focus_minutes: 0,
    daily_summary: "",
  };
}

export function recordDailyProgress(
  db: DatabaseSync,
  completedDelta: number,
  minutesDelta: number
): DailyMetrics {
  const current = getOrCreateTodayMetrics(db);
  const nextCompleted = Math.max(0, current.tasks_completed + completedDelta);
  const nextMinutes = Math.max(0, current.focus_minutes + minutesDelta);

  db.prepare(`
    UPDATE daily_metrics
    SET tasks_completed = ?, focus_minutes = ?
    WHERE date = ?
  `).run(nextCompleted, nextMinutes, current.date);

  return {
    ...current,
    tasks_completed: nextCompleted,
    focus_minutes: nextMinutes,
  };
}
