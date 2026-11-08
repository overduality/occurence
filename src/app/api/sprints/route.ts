import { NextResponse } from "next/server";
import { getDatabase, getWorkspaceSnapshot } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = getWorkspaceSnapshot();
    return NextResponse.json(snapshot.sprints);
  } catch (error) {
    console.error("GET /api/sprints error:", error);
    return NextResponse.json({ error: "Failed to fetch sprints" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDatabase();
    const {
      id: clientId,
      title,
      goal = "",
      makeActive = true,
      moveUnfinishedTasks = false,
    } = await req.json();

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Sprint title is required" }, { status: 400 });
    }

    const now = Date.now();
    const id =
      typeof clientId === "string" && clientId.startsWith("sprint-")
        ? clientId
        : `sprint-${now}-${Math.random().toString(36).slice(2, 6)}`;

    db.exec("BEGIN IMMEDIATE");
    try {
      if (makeActive) {
        db.prepare("UPDATE sprints SET status = 'completed' WHERE status = 'active'").run();
      }
      db.prepare(`
        INSERT INTO sprints (id, title, goal, status, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        id,
        title.trim(),
        typeof goal === "string" ? goal.trim() : "",
        makeActive ? "active" : "completed",
        now
      );

      // If user chose to roll over unfinished tasks into the new sprint
      if (moveUnfinishedTasks) {
        db.prepare(`
          UPDATE tasks
          SET sprint_id = ?, updated_at = ?
          WHERE status IN ('in_progress', 'todo')
        `).run(id, now);
      }

      db.exec("COMMIT");
    } catch (txErr) {
      db.exec("ROLLBACK");
      throw txErr;
    }

    const snapshot = getWorkspaceSnapshot();
    return NextResponse.json({ id, snapshot }, { status: 201 });
  } catch (error) {
    console.error("POST /api/sprints error:", error);
    return NextResponse.json({ error: "Failed to create sprint" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = getDatabase();
    const {
      id,
      title,
      goal,
      status,
      parkUnfinished = false,
      pullUnfinishedTasks = false,
      assignTaskIds,
    } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Sprint ID is required" }, { status: 400 });
    }

    const now = Date.now();

    db.exec("BEGIN IMMEDIATE");
    try {
      if (status === "active") {
        db.prepare("UPDATE sprints SET status = 'completed' WHERE status = 'active' AND id != ?").run(id);
      }

      db.prepare(`
        UPDATE sprints
        SET
          title = COALESCE(?, title),
          goal = COALESCE(?, goal),
          status = COALESCE(?, status)
        WHERE id = ?
      `).run(
        typeof title === "string" && title.trim() ? title.trim() : null,
        typeof goal === "string" ? goal.trim() : null,
        status === "active" || status === "completed" ? status : null,
        id
      );

      // Move unfinished tasks into this sprint
      if (pullUnfinishedTasks) {
        db.prepare(`
          UPDATE tasks
          SET sprint_id = ?, updated_at = ?
          WHERE status IN ('in_progress', 'todo')
        `).run(id, now);
      }

      // Assign specific task IDs to this sprint
      if (Array.isArray(assignTaskIds) && assignTaskIds.length > 0) {
        const updateTask = db.prepare("UPDATE tasks SET sprint_id = ?, updated_at = ? WHERE id = ?");
        for (const tId of assignTaskIds) {
          if (typeof tId === "string") {
            updateTask.run(id, now, tId);
          }
        }
      }

      if (status === "completed" && parkUnfinished) {
        db.prepare(`
          UPDATE tasks
          SET status = 'backlog', updated_at = ?
          WHERE sprint_id = ? AND status IN ('in_progress', 'todo')
        `).run(now, id);
      }

      db.exec("COMMIT");
    } catch (txErr) {
      db.exec("ROLLBACK");
      throw txErr;
    }

    const snapshot = getWorkspaceSnapshot();
    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("PATCH /api/sprints error:", error);
    return NextResponse.json({ error: "Failed to update sprint" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Sprint ID is required" }, { status: 400 });
    }

    db.exec("BEGIN IMMEDIATE");
    try {
      // Unlink tasks before deleting sprint so they are not orphaned
      db.prepare("UPDATE tasks SET sprint_id = NULL WHERE sprint_id = ?").run(id);
      db.prepare("DELETE FROM sprints WHERE id = ?").run(id);
      db.exec("COMMIT");
    } catch (txErr) {
      db.exec("ROLLBACK");
      throw txErr;
    }

    const snapshot = getWorkspaceSnapshot();
    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("DELETE /api/sprints error:", error);
    return NextResponse.json({ error: "Failed to delete sprint" }, { status: 500 });
  }
}
