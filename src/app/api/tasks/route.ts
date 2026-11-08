import { NextResponse } from "next/server";
import { getDatabase, getWorkspaceSnapshot } from "@/lib/db";
import {
  createTaskEntry,
  deleteTaskEntry,
  updateTaskEntry,
} from "./task-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = getWorkspaceSnapshot();
    return NextResponse.json(snapshot);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch workspace snapshot" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = getDatabase();
    const body = await req.json();

    if (!body?.title || typeof body.title !== "string" || !body.title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const { task, subtasks } = createTaskEntry(db, body);
    return NextResponse.json({ task, subtasks }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = getDatabase();
    const body = await req.json();

    const result = updateTaskEntry(db, body);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const db = getDatabase();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const clearDone = searchParams.get("clearDone") === "1";

    const result = deleteTaskEntry(db, id, clearDone);
    if ("error" in result && result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks error:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
