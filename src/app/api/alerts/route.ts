import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { listAlertRules, createAlertRule } from "@/lib/alerts/store";
import { addAuditEntry } from "@/lib/audit/store";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const all = await listAlertRules();
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "0") || all.length;
  const offset = parseInt(url.searchParams.get("offset") ?? "0");
  const sliced = all.slice(offset, offset + limit);
  return NextResponse.json({ items: sliced }, {
    headers: { "X-Total-Count": String(all.length) },
  });
}

const createSchema = z.object({
  name: z.string().min(1),
  metric: z.enum(["latency", "errorRate", "uptime", "deployFailRate", "flakyTests"]),
  operator: z.enum(["gt", "lt", "eq"]),
  threshold: z.number(),
  channel: z.enum(["email", "slack", "both"]),
  enabled: z.boolean().default(true),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neplatná data.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const created = await createAlertRule({
    ...parsed.data,
    createdBy: user.email,
  });

  await addAuditEntry({
    actor: user.email,
    action: "alert.create",
    target: created.name,
    details: `Metric: ${created.metric}, ${created.operator} ${created.threshold}`,
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
