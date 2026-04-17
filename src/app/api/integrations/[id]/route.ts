import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { deleteIntegration, getIntegration, updateIntegration } from "@/lib/integrations/store";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  const { id } = await params;
  const item = await getIntegration(id);
  if (!item) return NextResponse.json({ error: "Integrace neexistuje." }, { status: 404 });
  return NextResponse.json({ ...item, credentials: { _redacted: true } });
}

const patchSchema = z
  .object({
    displayName: z.string().min(1).optional(),
    enabled: z.boolean().optional(),
    credentials: z.record(z.string()).optional(),
  })
  .strict();

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná data.", issues: parsed.error.flatten() }, { status: 400 });
  }
  const updated = await updateIntegration(id, parsed.data);
  if (!updated) return NextResponse.json({ error: "Integrace neexistuje." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const ok = await deleteIntegration(id);
  if (!ok) return NextResponse.json({ error: "Integrace neexistuje." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
