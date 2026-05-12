import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import {
  deleteApplication,
  getApplication,
  updateApplication,
  ApplicationStoreError,
} from "@/lib/applications/store";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  const { id } = await params;
  const item = await getApplication(id);
  if (!item) return NextResponse.json({ error: "Aplikace neexistuje." }, { status: 404 });
  return NextResponse.json(item);
}

const patchSchema = z
  .object({
    name: z.string().min(1).max(120).optional(),
    slug: z.string().min(1).max(60).optional(),
    language: z.string().min(1).max(60).optional(),
    description: z.string().max(500).optional(),
    repoUrl: z.string().url().or(z.literal("")).optional(),
    owners: z.array(z.string()).optional(),
    environmentIds: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
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
    const updated = await updateApplication(id, parsed.data);
    if (!updated) return NextResponse.json({ error: "Aplikace neexistuje." }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof ApplicationStoreError) {
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
  const ok = await deleteApplication(id);
  if (!ok) return NextResponse.json({ error: "Aplikace neexistuje." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
