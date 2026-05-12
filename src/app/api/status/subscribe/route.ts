import { NextResponse } from "next/server";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`subscribe:${ip}`, 5, 60 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Příliš mnoho pokusů" },
        { status: 429, headers: getRateLimitHeaders(rl.remaining, 5) },
      );
    }

    const { email } = await req.json().catch(() => ({ email: null }));
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Neplatný e-mail" }, { status: 400 });
    }
    // MVP: just log. In production, store in DB/Blob.
    console.log("[subscribe] New subscription:", email);
    return NextResponse.json({ ok: true, message: "Odběr nastaven." });
  } catch (err) {
    console.error("[status/subscribe]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
