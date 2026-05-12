import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { createIntegration, listIntegrations } from "@/lib/integrations/store";
import { getProviderDefinition } from "@/lib/integrations/registry";
import { addAuditEntry } from "@/lib/audit/store";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  const items = await listIntegrations();
  // Credentials v GET odpovědi schováváme.
  const sanitized = items.map((i) => ({ ...i, credentials: Object.keys(i.credentials).length > 0 ? { _redacted: true } : {} }));
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "0") || sanitized.length;
  const offset = parseInt(url.searchParams.get("offset") ?? "0");
  const sliced = sanitized.slice(offset, offset + limit);
  return NextResponse.json({ items: sliced }, {
    headers: { "X-Total-Count": String(sanitized.length) },
  });
}

const createSchema = z.object({
  providerKey: z.string().min(1),
  displayName: z.string().min(1),
  credentials: z.record(z.string()).default({}),
  scope: z
    .object({
      appIds: z.array(z.string()).optional(),
      envIds: z.array(z.string()).optional(),
    })
    .optional(),
  enabled: z.boolean().default(true),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "K této akci nemáš oprávnění." }, { status: 403 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Neplatná data.", issues: parsed.error.flatten() }, { status: 400 });
  }

  const def = getProviderDefinition(parsed.data.providerKey);
  if (!def) {
    return NextResponse.json({ error: `Neznámý provider: ${parsed.data.providerKey}` }, { status: 400 });
  }

  // Validace credentials podle schématu provideru. Reálný adapter to vynucuje;
  // mock adaptery mají volný schéma.
  const credsCheck = def.credentialsSchema.safeParse(parsed.data.credentials);
  if (!credsCheck.success) {
    return NextResponse.json(
      { error: "Credentials neodpovídají schématu.", issues: credsCheck.error.flatten() },
      { status: 400 }
    );
  }

  const created = await createIntegration({
    providerKey: parsed.data.providerKey,
    displayName: parsed.data.displayName,
    credentials: parsed.data.credentials,
    scope: parsed.data.scope ?? {},
    enabled: parsed.data.enabled,
    createdBy: user.email,
  });

  await addAuditEntry({
    actor: user.email,
    action: "integration.create",
    target: created.displayName,
    details: `Provider: ${created.providerKey}`,
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
