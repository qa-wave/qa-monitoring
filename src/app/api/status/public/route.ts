import { NextResponse } from "next/server";
import { publicStatusData } from "@/lib/dashboard-data";

export const revalidate = 30;

export async function GET() {
  const data = publicStatusData();
  return NextResponse.json({
    status: data.overallStatus,
    services: data.services.map((s) => ({
      name: s.app.name,
      status: s.health?.status ?? "muted",
      uptimePct30d: s.health?.uptimePct30d ?? 0,
    })),
    activeIncidents: data.activeIncidents.map((i) => ({
      id: i.id,
      title: i.title,
      severity: i.severity,
      startedAt: i.startedAt,
      status: i.status,
    })),
    maintenance: data.maintenance.map((m) => ({
      id: m.id,
      title: m.title,
      startsAt: m.startsAt,
      endsAt: m.endsAt,
    })),
  });
}
