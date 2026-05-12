import { NextResponse } from "next/server";
import { publicStatusData } from "@/lib/dashboard-data";

export async function GET() {
  try {
    const data = await publicStatusData();
    return NextResponse.json({ status: data.overallStatus, services: data.services.length });
  } catch (err) {
    console.error("[health]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
