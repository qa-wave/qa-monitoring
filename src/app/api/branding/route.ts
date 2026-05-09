import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { brandSettingsSchema, getBrandSettings, saveBrandSettings } from "@/lib/branding";

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
  const saved = await saveBrandSettings(parsed.data as Parameters<typeof saveBrandSettings>[0]);
  return NextResponse.json(saved);
}
