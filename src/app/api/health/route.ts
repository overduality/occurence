import { NextResponse } from "next/server";
import { getWalHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const health = getWalHealth();
    return NextResponse.json(health);
  } catch (error) {
    console.error("GET /api/health error:", error);
    return NextResponse.json(
      { status: "unhealthy", error: "Database check failed" },
      { status: 500 }
    );
  }
}
