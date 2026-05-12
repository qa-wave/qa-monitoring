import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { SCHEMA } from "@/lib/db-schema";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json(
      { error: "DATABASE_URL not configured" },
      { status: 503 },
    );
  }

  try {
    // neon() returns a tagged-template function; use sql.raw() pattern
    // by passing schema as a single-element TemplateStringsArray
    const raw = [SCHEMA] as unknown as TemplateStringsArray;
    Object.defineProperty(raw, "raw", { value: [SCHEMA] });
    await db(raw);
    return NextResponse.json({ ok: true, message: "Migration complete" });
  } catch (err) {
    return NextResponse.json(
      { error: String((err as Error).message) },
      { status: 500 },
    );
  }
}
