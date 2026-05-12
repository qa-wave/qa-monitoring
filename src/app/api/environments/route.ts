import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import {
  createEnvironment,
  listEnvironments,
  EnvironmentStoreError,
} from "@/lib/environments/store";

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  const all = await listEnvironments();
  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "0") || all.length;
  const offset = parseInt(url.searchParams.get("offset") ?? "0");
  const sliced = all.slice(offset, offset + limit);
  return NextResponse.json({ items: sliced }, {
    headers: { "X-Total-Count": String(all.length) },
  });
}

const createSchema = z.object({
  name: z.string().min(1, "Název je povinný.").max(120),
  slug: z.string().min(1, "Slug je povinný.").max(60),
  url: z.string().url("Neplatná URL."),
  region: z.string().min(1, "Region je povinný.").max(60),
  color: z.string().default("#64748b"),
  isProduction: z.boolean().default(false),
  order: z.number().int().default(0),
});

export async function POST(req: Request) {
  const actor = await getSessionUser();
  if (!actor) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  if (actor.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const raw = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Neplatná data.", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const created = await createEnvironment(parsed.data);
    return NextResponse.json({ id: created.id, item: created }, { status: 201 });
  } catch (e) {
    if (e instanceof EnvironmentStoreError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 409 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
