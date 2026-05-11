import { NextResponse } from "next/server";
import { healthChecks } from "@/data/health-checks";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ok = healthChecks.filter((h) => h.status === "ok").length;
  const warn = healthChecks.filter((h) => h.status === "warn").length;
  const down = healthChecks.filter((h) => h.status === "down").length;
  const summary = { ok, warn, down, total: healthChecks.length, checkedAt: new Date().toISOString() };

  console.log("[cron/health-check]", summary);
  return NextResponse.json(summary);
}
