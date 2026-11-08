import { NextResponse } from "next/server";
import { triageInput } from "@/lib/ai";
import { getDatabase, getWorkspaceSnapshot } from "@/lib/db";
import type { TriageMode } from "@/types/outterring";

const MAX_ACTIVE_RUNWAY = 5;

export async function POST(req: Request) {
  try {
    const { text, mode = "auto", autoSave = true } = await req.json();
    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const validModes: TriageMode[] = ["auto", "task", "sprint", "doc"];
    const triageMode: TriageMode = validModes.includes(mode) ? mode : "auto";

    const triage = await triageInput(text.trim(), triageMode);
    const db = getDatabase();
    const now = Date.now();

    let savedKind: "task" | "sprint" | "doc" = triage.type;
    let primaryId: string | null = null;

    if (autoSave) {
      db.exec("BEGIN IMMEDIATE");
      try {
        const activeRow = db
          .prepare("SELECT count(*) as c FROM tasks WHERE status = 'in_progress'")
          .get() as { c: number };
        const runwayRow = db
          .prepare("SELECT count(*) as c FROM tasks WHERE status IN ('in_progress', 'todo')")
          .get() as { c: number };

        let hasActiveFocus = activeRow.c > 0;
        let currentRunwayCount = runwayRow.c;

        const insertTask = db.prepare(`
          INSERT INTO tasks (
            id, title, description, status, priority, estimated_minutes,
            why_it_matters, kickstart_action, kickstart_completed, sprint_id,
            order_idx, created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?)
        `);
        const insertSub = db.prepare(`
          INSERT INTO subtasks (id, task_id, title, is_completed, order_idx)
          VALUES (?, ?, ?, 0, ?)
        `);

        if (triage.type === "task" && triage.task) {
          const id = `task-${now}-${Math.random().toString(36).slice(2, 6)}`;
          primaryId = id;
          const nextStatus = !hasActiveFocus
            ? "in_progress"
            : currentRunwayCount < MAX_ACTIVE_RUNWAY
              ? "todo"
              : "backlog";

          insertTask.run(
            id,
            triage.task.title,
            triage.task.description || "",
            nextStatus,
            triage.task.priority,
            triage.task.estimatedMinutes,
            triage.task.whyItMatters,
            triage.task.kickstartAction,
            null,
            0,
            now,
            now
          );

          triage.task.subtasks?.forEach((st, idx) => {
            insertSub.run(`sub-${now}-${idx}-${Math.random().toString(36).slice(2, 5)}`, id, st, idx);
          });
        } else if (triage.type === "sprint" && triage.sprint) {
          const sprintId = `sprint-${now}-${Math.random().toString(36).slice(2, 6)}`;
          primaryId = sprintId;

          db.prepare("UPDATE sprints SET status = 'completed' WHERE status = 'active'").run();
          db.prepare(`
            INSERT INTO sprints (id, title, goal, status, created_at)
            VALUES (?, ?, ?, 'active', ?)
          `).run(sprintId, triage.sprint.title, triage.sprint.goal, now);

          triage.sprint.activeSteps.forEach((step, idx) => {
            const taskId = `task-${now}-${idx}-${Math.random().toString(36).slice(2, 5)}`;
            let stepStatus: "in_progress" | "todo" | "backlog" = "todo";
            if (!hasActiveFocus && idx === 0) {
              stepStatus = "in_progress";
              hasActiveFocus = true;
              currentRunwayCount += 1;
            } else if (currentRunwayCount < MAX_ACTIVE_RUNWAY) {
              stepStatus = "todo";
              currentRunwayCount += 1;
            } else {
              stepStatus = "backlog";
            }

            insertTask.run(
              taskId,
              step.title,
              step.description,
              stepStatus,
              step.priority,
              step.estimatedMinutes,
              step.whyItMatters,
              step.kickstartAction,
              sprintId,
              idx,
              now - idx,
              now - idx
            );

            step.subtasks?.forEach((st, sIdx) => {
              insertSub.run(
                `sub-${now}-${idx}-${sIdx}-${Math.random().toString(36).slice(2, 5)}`,
                taskId,
                st,
                sIdx
              );
            });
          });

          triage.sprint.parkedSteps.forEach((step, idx) => {
            const taskId = `task-${now}-parked-${idx}-${Math.random().toString(36).slice(2, 5)}`;
            insertTask.run(
              taskId,
              step.title,
              step.description,
              "backlog",
              step.priority,
              step.estimatedMinutes,
              step.whyItMatters,
              step.kickstartAction,
              sprintId,
              idx,
              now - 100 - idx,
              now - 100 - idx
            );
          });
        } else if (triage.type === "doc" && triage.doc) {
          const docId = `doc-${now}-${Math.random().toString(36).slice(2, 6)}`;
          primaryId = docId;
          db.prepare(`
            INSERT INTO docs (id, title, content, category, tags, is_pinned, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 0, ?, ?)
          `).run(
            docId,
            triage.doc.title,
            triage.doc.content,
            triage.doc.category,
            JSON.stringify(triage.doc.tags || []),
            now,
            now
          );
        }

        db.exec("COMMIT");
      } catch (txErr) {
        db.exec("ROLLBACK");
        throw txErr;
      }
    }

    const snapshot = getWorkspaceSnapshot();
    return NextResponse.json({
      triage,
      savedKind,
      primaryId,
      snapshot,
    });
  } catch (error) {
    console.error("POST /api/ai/triage error:", error);
    return NextResponse.json({ error: "Failed to process AI triage" }, { status: 500 });
  }
}
