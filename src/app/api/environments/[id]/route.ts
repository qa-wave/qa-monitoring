import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import {
  deleteEnvironment,
  getEnvironment,
  updateEnvironment,
  EnvironmentStoreError,
} from "@/lib/environments/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  const { id } = await params;
  const item = await getEnvironment(id);
  if (!item) return NextResponse.json({ error: "Prostředí neexistuje." }, { status: 404 });
  return NextResponse.json(item);
}

const patchSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    slug: z.string().min(1).max(60).optional(),
    url: z.string().url().optional(),
    region: z.string().min(1).max(60).optional(),
    color: z.string().optional(),
    isProduction: z.boolean().optional(),
    order: z.number().int().optional(),
  })
  .strict();

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neplatná data.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const updated = await updateEnvironment(id, parsed.data);
    if (!updated) return NextResponse.json({ error: "Prostředí neexistuje." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof EnvironmentStoreError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 409 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const ok = await deleteEnvironment(id);
  if (!ok) return NextResponse.json({ error: "Prostředí neexistuje." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
