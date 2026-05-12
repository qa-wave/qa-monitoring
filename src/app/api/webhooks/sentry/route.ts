import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { sendSlackNotification } from "@/lib/notifications/slack";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`webhook-sentry:${ip}`, 100, 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rl.remaining, 100) },
      );
    }

    const body = await req.text();
    const resource = req.headers.get("sentry-hook-resource") ?? "unknown";
    const signature = req.headers.get("sentry-hook-signature");
    const secret = process.env.SENTRY_WEBHOOK_SECRET;

    if (secret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }
      const expected = createHmac("sha256", secret).update(body).digest("hex");
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expected);
      if (
        sigBuf.length !== expBuf.length ||
        !timingSafeEqual(sigBuf, expBuf)
      ) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      logger.warn("webhook.sentry.no_secret", { message: "SENTRY_WEBHOOK_SECRET is not configured — accepting without signature verification (dev mode)" });
    }

    logger.info("webhook.sentry.received", { resource, ip });

    // Notify Slack on issue or error events
    if (resource === "issue" || resource === "error") {
      try {
        const payload = JSON.parse(body);
        const title = payload.data?.issue?.title ?? payload.data?.error?.title ?? "Unknown Sentry event";
        const url = payload.data?.issue?.web_url ?? payload.url ?? "";
        const message = `🚨 Sentry ${resource}: ${title}${url ? `\n<${url}|Zobrazit v Sentry>` : ""}`;
        await sendSlackNotification(message);
      } catch (parseErr) {
        logger.error("webhook.sentry.slack_notify_failed", { error: String(parseErr) });
      }
    }

    return NextResponse.json({ ok: true, resource });
  } catch (err) {
    logger.error("webhook.sentry.error", { error: String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
