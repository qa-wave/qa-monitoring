import { NextResponse } from "next/server";
import { syncEnabledIntegrations } from "@/lib/ingest/engine";
import { logger } from "@/lib/logger";
import { withTiming } from "@/lib/request-timing";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return withTiming("cron.ingest", async () => {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const results = await syncEnabledIntegrations();
      const runs = results.map((result) => result.run);
      logger.info("cron.ingest", {
        integrations: runs.length,
        statuses: runs.map((run) => run.status),
      });
      return NextResponse.json({ ok: true, runs });
    } catch (err) {
      logger.error("cron.ingest.error", { error: String(err) });
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  });
}
