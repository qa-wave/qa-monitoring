import { NextResponse } from "next/server";
import { publicStatusData } from "@/lib/dashboard-data";

export async function GET() {
  const data = publicStatusData();
  return NextResponse.json({ status: data.overallStatus, services: data.services.length });
}
