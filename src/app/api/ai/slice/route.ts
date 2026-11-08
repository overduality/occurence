import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { handleDocSlice, handleTaskSlice } from "./slice-handlers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { source = "task", taskId, docId, title, content } = body;
    const db = getDatabase();

    if (source === "doc") {
      const result = await handleDocSlice(db, { docId, title, content });
      if (result.error) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      return NextResponse.json(result.data);
    }

    // Default: Slice an existing task into smaller physical-verb micro-actions
    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const result = await handleTaskSlice(db, taskId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/ai/slice error:", error);
    return NextResponse.json({ error: "Failed to slice into micro-actions" }, { status: 500 });
  }
}
