import { NextResponse } from "next/server";
import { z } from "zod";
import { signIn } from "@/lib/auth";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatný formát přihlášení." }, { status: 400 });
  }
  const user = await signIn(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: "Uživatel s tímto e-mailem neexistuje." }, { status: 401 });
  }
  return NextResponse.json({ ok: true, role: user.role });
}
