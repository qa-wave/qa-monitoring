import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import {
  deleteUser,
  findUserById,
  toPublicUser,
  updateUser,
  UserStoreError,
} from "@/lib/users/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const target = await findUserById(id);
  if (!target) return NextResponse.json({ error: "Uživatel neexistuje." }, { status: 404 });
  return NextResponse.json(toPublicUser(target));
}

const patchSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    role: z.enum(["viewer", "admin"]).optional(),
    personaPreference: z.enum(["all", "dev", "po", "tester"]).optional(),
    password: z.string().min(6).max(200).optional(),
  })
  .strict();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neplatná data.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const updated = await updateUser(id, parsed.data, actor.id);
    return NextResponse.json(toPublicUser(updated));
  } catch (e) {
    if (e instanceof UserStoreError) {
      const status = e.code === "not_found" ? 404 : e.code === "password_too_short" ? 400 : 409;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  try {
    await deleteUser(id, actor.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UserStoreError) {
      const status = e.code === "not_found" ? 404 : 409;
      return NextResponse.json({ error: e.message, code: e.code }, { status });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
