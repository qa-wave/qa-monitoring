import { NextResponse } from "next/server";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { rateLimit, getRateLimitHeaders } from "@/lib/rate-limit";

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
      return NextResponse.json({ error: "Neplatný e-mail nebo heslo." }, { status: 401 });
    }
    return NextResponse.json({ ok: true, role: user.role });
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
