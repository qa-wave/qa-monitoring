import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { syncIntegration } from "@/lib/ingest/engine";
import { addAuditEntry } from "@/lib/audit/store";
import { captureException } from "@/lib/error-tracking";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "K této akci nemáš oprávnění." }, { status: 403 });
  }

  const { id } = await params;
  try {
    const result = await syncIntegration(id);
    await addAuditEntry({
      actor: user.email,
      action: "integration.sync",
      target: id,
      details: `Provider: ${result.run.providerKey}, status: ${result.run.status}`,
    });
    return NextResponse.json({ ok: true, run: result.run });
  } catch (err) {
    captureException(err, { route: "integrations.sync.one", integrationId: id });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
