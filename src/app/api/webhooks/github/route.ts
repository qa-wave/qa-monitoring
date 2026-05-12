import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { sendSlackNotification, formatDeploySlack } from "@/lib/notifications/slack";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`webhook-github:${ip}`, 100, 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: getRateLimitHeaders(rl.remaining, 100) },
      );
    }

    const body = await req.text();
    const event = req.headers.get("x-github-event") ?? "unknown";
    const signature = req.headers.get("x-hub-signature-256");
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    if (secret) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }
      const expected =
        "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expected);
      if (
        sigBuf.length !== expBuf.length ||
        !timingSafeEqual(sigBuf, expBuf)
      ) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    } else {
      console.warn("[webhook/github] GITHUB_WEBHOOK_SECRET is not configured — accepting without signature verification (dev mode)");
    }

    console.log(`[webhook/github] event=${event}`);

    // Notify Slack on failed workflow runs
    if (event === "workflow_run") {
      try {
        const payload = JSON.parse(body);
        if (payload.workflow_run?.conclusion === "failure") {
          const repoName = payload.repository?.full_name ?? "unknown";
          const runName = payload.workflow_run?.name ?? "workflow";
          const message = formatDeploySlack(repoName, runName, "failed");
          await sendSlackNotification(message);
        }
      } catch (parseErr) {
        console.error("[webhook/github] Failed to parse payload for Slack notification:", parseErr);
      }
    }

    return NextResponse.json({ ok: true, event });
  } catch (err) {
    console.error("[webhook/github]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
