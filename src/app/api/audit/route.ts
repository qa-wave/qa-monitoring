import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { listAuditEntries } from "@/lib/audit/store";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit") || "50"), 200);

  const items = await listAuditEntries(limit);
  return NextResponse.json({ items });
}
