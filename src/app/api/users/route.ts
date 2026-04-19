import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { createUser, listPublicUsers, UserStoreError } from "@/lib/users/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const items = await listPublicUsers();
  return NextResponse.json({ items });
}

const createSchema = z.object({
  email: z.string().email("Neplatný e-mail."),
  name: z.string().min(1, "Jméno je povinné.").max(120),
  role: z.enum(["viewer", "admin"]),
  personaPreference: z.enum(["all", "dev", "po", "tester"]).default("dev"),
  password: z
    .string()
    .min(6, "Heslo musí mít alespoň 6 znaků.")
    .max(200),
});

export async function POST(req: Request) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neplatná data.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const created = await createUser({
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role,
      personaPreference: parsed.data.personaPreference,
      password: parsed.data.password,
    });
    return NextResponse.json({ id: created.id }, { status: 201 });
  } catch (e) {
    if (e instanceof UserStoreError) {
      const status = e.code === "email_exists" ? 409 : e.code === "password_too_short" ? 400 : 409;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
