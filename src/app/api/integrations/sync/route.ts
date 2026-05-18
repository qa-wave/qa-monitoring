import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { syncEnabledIntegrations } from "@/lib/ingest/engine";
import { addAuditEntry } from "@/lib/audit/store";
import { captureException } from "@/lib/error-tracking";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "K této akci nemáš oprávnění." }, { status: 403 });
  }

  try {
    const results = await syncEnabledIntegrations();
    const runs = results.map((result) => result.run);
    await addAuditEntry({
      actor: user.email,
      action: "integrations.sync",
      target: "all",
      details: `Synchronizováno ${runs.length} integrací.`,
    });
    return NextResponse.json({ ok: true, runs });
  } catch (err) {
    captureException(err, { route: "integrations.sync" });
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
