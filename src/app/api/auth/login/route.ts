import { NextResponse } from "next/server";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { captureException } from "@/lib/error-tracking";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Příliš mnoho pokusů" },
        { status: 429, headers: getRateLimitHeaders(rl.remaining, 10) },
      );
    }

    const raw = await req.json().catch(() => null);
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: "Neplatný formát přihlášení." }, { status: 400 });
    }

    const user = await signIn(parsed.data.email, parsed.data.password);
    if (!user) {
      logger.warn("auth.login_failed", { email: parsed.data.email, ip });
      return NextResponse.json({ error: "Neplatný e-mail nebo heslo." }, { status: 401 });
    }
    logger.info("auth.login_success", { email: parsed.data.email, role: user.role, ip });
    return NextResponse.json({ ok: true, role: user.role });
  } catch (err) {
    captureException(err, { route: "login" });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
