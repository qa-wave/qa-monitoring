import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { updateAlertRule, deleteAlertRule } from "@/lib/alerts/store";
import { addAuditEntry } from "@/lib/audit/store";

const patchSchema = z.object({
  name: z.string().min(1).optional(),
  metric: z.enum(["latency", "errorRate", "uptime", "deployFailRate", "flakyTests"]).optional(),
  operator: z.enum(["gt", "lt", "eq"]).optional(),
  threshold: z.number().optional(),
  channel: z.enum(["email", "slack", "both"]).optional(),
  enabled: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const raw = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neplatná data.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updated = await updateAlertRule(id, parsed.data);
  if (!updated) {
    return NextResponse.json({ error: "Pravidlo nenalezeno." }, { status: 404 });
  }

  await addAuditEntry({
    actor: user.email,
    action: "alert.update",
    target: updated.name,
    details: JSON.stringify(parsed.data),
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const deleted = await deleteAlertRule(id);
  if (!deleted) {
    return NextResponse.json({ error: "Pravidlo nenalezeno." }, { status: 404 });
  }

  await addAuditEntry({
    actor: user.email,
    action: "alert.delete",
    target: id,
  });

  return NextResponse.json({ ok: true });
}
