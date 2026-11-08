import { NextResponse } from "next/server";
import { getGroundingAdvice } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { taskTitle = "", kickstartAction = "" } = await req.json();
    const advice = await getGroundingAdvice(taskTitle, kickstartAction);
    return NextResponse.json(advice);
  } catch (error) {
    console.error("POST /api/ai/ground error:", error);
    return NextResponse.json(
      { error: "Failed to generate grounding advice" },
      { status: 500 }
    );
  }
}
