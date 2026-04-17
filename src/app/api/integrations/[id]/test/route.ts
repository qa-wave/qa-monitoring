import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getIntegration, updateIntegration } from "@/lib/integrations/store";
import { getProviderDefinition } from "@/lib/integrations/registry";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const item = await getIntegration(id);
  if (!item) return NextResponse.json({ error: "Integrace neexistuje." }, { status: 404 });

  const def = getProviderDefinition(item.providerKey);
  if (!def) return NextResponse.json({ error: "Neznámý provider." }, { status: 400 });

  try {
    const adapter = def.create(item.credentials as never);
    const result = await adapter.testConnection();
    await updateIntegration(id, {
      lastTestedAt: new Date().toISOString(),
      lastTestResult: result.ok ? "ok" : "error",
      lastTestMessage: result.message,
    });
    return NextResponse.json(result);
  } catch (e) {
    const message = (e as Error).message;
    await updateIntegration(id, {
      lastTestedAt: new Date().toISOString(),
      lastTestResult: "error",
      lastTestMessage: message,
    });
    return NextResponse.json({ ok: false, message }, { status: 200 });
  }
}
