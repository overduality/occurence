import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { ensurePhysicalVerb } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const db = getDatabase();
    const { id: clientId, task_id, title } = await req.json();

    if (!task_id || !title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "task_id and title are required" }, { status: 400 });
    }

    const maxRow = db
      .prepare("SELECT COALESCE(MAX(order_idx), -1) as maxIdx FROM subtasks WHERE task_id = ?")
      .get(task_id) as { maxIdx: number };

    const id =
      typeof clientId === "string" && clientId.startsWith("sub-")
        ? clientId
        : `sub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const cleanTitle = ensurePhysicalVerb(title.trim());

    db.prepare(`
      INSERT INTO subtasks (id, task_id, title, is_completed, order_idx)
      VALUES (?, ?, ?, 0, ?)
    `).run(id, task_id, cleanTitle, maxRow.maxIdx + 1);

    const created = db.prepare("SELECT * FROM subtasks WHERE id = ?").get(id);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/subtasks error:", error);
    return NextResponse.json({ error: "Failed to add subtask" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = getDatabase();
    const { id, is_completed, title } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Subtask ID is required" }, { status: 400 });
    }

    db.prepare(`
      UPDATE subtasks
      SET
        is_completed = COALESCE(?, is_completed),
        title = COALESCE(?, title)
      WHERE id = ?
    `).run(
      typeof is_completed === "number" ? is_completed : null,
      typeof title === "string" ? title.trim() : null,
      id
    );

    const updated = db.prepare("SELECT * FROM subtasks WHERE id = ?").get(id);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/subtasks error:", error);
    return NextResponse.json({ error: "Failed to update subtask" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Subtask ID is required" }, { status: 400 });
    }

    db.prepare("DELETE FROM subtasks WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/subtasks error:", error);
    return NextResponse.json({ error: "Failed to delete subtask" }, { status: 500 });
  }
}
