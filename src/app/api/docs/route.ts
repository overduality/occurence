import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = getDatabase();
    const docs = db
      .prepare("SELECT * FROM docs ORDER BY is_pinned DESC, updated_at DESC")
      .all();
    return NextResponse.json(docs);
  } catch (error) {
    console.error("GET /api/docs error:", error);
    return NextResponse.json({ error: "Failed to fetch docs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDatabase();
    const body = await req.json();
    const { id, title, content, category, tags, is_pinned, createNew = false } = body;

    const now = Date.now();
    const tagsJson =
      tags === undefined
        ? null
        : typeof tags === "string"
          ? tags
          : JSON.stringify(Array.isArray(tags) ? tags : []);

    if (id && !createNew) {
      const existing = db.prepare("SELECT id FROM docs WHERE id = ?").get(id);
      if (existing) {
        db.prepare(`
          UPDATE docs SET 
            title = COALESCE(?, title),
            content = COALESCE(?, content),
            category = COALESCE(?, category),
            tags = COALESCE(?, tags),
            is_pinned = COALESCE(?, is_pinned),
            updated_at = ?
          WHERE id = ?
        `).run(
          typeof title === "string" ? title : null,
          typeof content === "string" ? content : null,
          typeof category === "string" ? category : null,
          tagsJson,
          typeof is_pinned === "number" ? is_pinned : null,
          now,
          id
        );

        const updated = db.prepare("SELECT * FROM docs WHERE id = ?").get(id);
        return NextResponse.json(updated);
      }
    }

    const newId =
      typeof id === "string" && id.startsWith("doc-")
        ? id
        : `doc-${now}-${Math.random().toString(36).slice(2, 6)}`;

    db.prepare(`
      INSERT INTO docs (id, title, content, category, tags, is_pinned, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      typeof title === "string" && title.trim() ? title.trim() : "Untitled Note",
      typeof content === "string" ? content : "",
      typeof category === "string" ? category : "general",
      tagsJson ?? "[]",
      is_pinned ? 1 : 0,
      now,
      now
    );

    const created = db.prepare("SELECT * FROM docs WHERE id = ?").get(newId);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/docs error:", error);
    return NextResponse.json({ error: "Failed to save doc" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Doc ID is required" }, { status: 400 });
    }

    db.prepare("DELETE FROM docs WHERE id = ?").run(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/docs error:", error);
    return NextResponse.json({ error: "Failed to delete doc" }, { status: 500 });
  }
}
