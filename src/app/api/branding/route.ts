import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { brandSettingsSchema, getBrandSettings, saveBrandSettings } from "@/lib/branding";
import { addAuditEntry } from "@/lib/audit/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  const brand = await getBrandSettings();
  return NextResponse.json(brand);
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") {
    return NextResponse.json({ error: "K této akci nemáš oprávnění." }, { status: 403 });
  }
  const raw = await req.json().catch(() => null);
  const parsed = brandSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neplatná data.", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const saved = await saveBrandSettings(parsed.data as Parameters<typeof saveBrandSettings>[0]);
    await addAuditEntry({
      actor: user.email,
      action: "branding.update",
      target: "brand-settings",
      details: `Style: ${(parsed.data as Record<string, unknown>).style ?? "unchanged"}`,
    });
    return NextResponse.json(saved);
  } catch (err) {
    console.error("[api/branding] Save failed:", err);
    return NextResponse.json({ error: String((err as Error).message) }, { status: 500 });
  }
}
