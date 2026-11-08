import { NextResponse } from "next/server";
import { getDatabase, getWorkspaceSnapshot, DEFAULT_COLUMNS } from "@/lib/db";
import type { KanbanColumn } from "@/types/outterring";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDatabase();
    const columns = db.prepare("SELECT * FROM kanban_columns ORDER BY order_idx ASC").all() as unknown as KanbanColumn[];
    return NextResponse.json({ columns: columns.length > 0 ? columns : DEFAULT_COLUMNS });
  } catch (error) {
    console.error("GET /api/columns error:", error);
    return NextResponse.json({ error: "Failed to fetch columns" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const { title, wip_limit = null, color = "accent" } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Column title is required" }, { status: 400 });
    }

    const cleanTitle = title.trim();
    const slugBase = cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24);
    const id = `col-${slugBase || "stage"}-${Math.random().toString(36).slice(2, 6)}`;

    // Place new column right before "done" if "done" exists, else at end
    const columns = db.prepare("SELECT * FROM kanban_columns ORDER BY order_idx ASC").all() as unknown as KanbanColumn[];
    const doneCol = columns.find((c) => c.id === "done");
    const targetOrder = doneCol ? doneCol.order_idx : columns.length;

    db.exec("BEGIN IMMEDIATE");
    try {
      // Shift subsequent columns forward
      db.prepare("UPDATE kanban_columns SET order_idx = order_idx + 1 WHERE order_idx >= ?").run(targetOrder);

      const parsedLimit = typeof wip_limit === "number" && wip_limit > 0 ? Math.round(wip_limit) : null;
      db.prepare(`
        INSERT INTO kanban_columns (id, title, order_idx, wip_limit, is_system, color)
        VALUES (?, ?, ?, ?, 0, ?)
      `).run(id, cleanTitle, targetOrder, parsedLimit, color || "accent");

      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }

    const snapshot = getWorkspaceSnapshot();
    return NextResponse.json({ id, snapshot }, { status: 201 });
  } catch (error) {
    console.error("POST /api/columns error:", error);
    return NextResponse.json({ error: "Failed to create column" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const { id, title, wip_limit, color, order_idx, reorder } = body;

    db.exec("BEGIN IMMEDIATE");
    try {
      if (Array.isArray(reorder)) {
        const updateStmt = db.prepare("UPDATE kanban_columns SET order_idx = ? WHERE id = ?");
        reorder.forEach((item: { id: string; order_idx: number }) => {
          if (item.id && typeof item.order_idx === "number") {
            updateStmt.run(item.order_idx, item.id);
          }
        });
      } else if (id && typeof id === "string") {
        const existing = db.prepare("SELECT * FROM kanban_columns WHERE id = ?").get(id) as unknown as (KanbanColumn | undefined);
        if (!existing) {
          db.exec("ROLLBACK");
          return NextResponse.json({ error: "Column not found" }, { status: 404 });
        }

        const nextTitle = typeof title === "string" && title.trim() ? title.trim() : existing.title;
        const nextLimit =
          wip_limit === null
            ? null
            : typeof wip_limit === "number" && wip_limit > 0
              ? Math.round(wip_limit)
              : (existing.wip_limit ?? null);
        const nextColor = typeof color === "string" ? color : (existing.color ?? "accent");
        const nextOrder = typeof order_idx === "number" ? order_idx : (existing.order_idx ?? 0);

        db.prepare(`
          UPDATE kanban_columns
          SET title = ?, wip_limit = ?, color = ?, order_idx = ?
          WHERE id = ?
        `).run(nextTitle, nextLimit, nextColor, nextOrder, id);
      }

      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }

    const snapshot = getWorkspaceSnapshot();
    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("PATCH /api/columns error:", error);
    return NextResponse.json({ error: "Failed to update column" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Column id is required" }, { status: 400 });
    }

    const db = getDatabase();
    const column = db.prepare("SELECT * FROM kanban_columns WHERE id = ?").get(id) as unknown as (KanbanColumn | undefined);
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    if (column.is_system === 1) {
      return NextResponse.json({ error: "Built-in system columns cannot be removed" }, { status: 400 });
    }

    db.exec("BEGIN IMMEDIATE");
    try {
      // Safely move any tasks in this column back to "todo"
      const now = Date.now();
      db.prepare("UPDATE tasks SET status = 'todo', updated_at = ? WHERE status = ?").run(now, id);

      // Delete the column
      db.prepare("DELETE FROM kanban_columns WHERE id = ?").run(id);

      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }

    const snapshot = getWorkspaceSnapshot();
    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("DELETE /api/columns error:", error);
    return NextResponse.json({ error: "Failed to delete column" }, { status: 500 });
  }
}
