import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import {
  createApplication,
  listApplications,
  ApplicationStoreError,
} from "@/lib/applications/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Nepřihlášený" }, { status: 401 });
  const items = await listApplications();
  return NextResponse.json({ items });
}

const createSchema = z.object({
  name: z.string().min(1, "Název je povinný.").max(120),
  slug: z.string().min(1, "Slug je povinný.").max(60),
  language: z.string().min(1, "Jazyk je povinný.").max(60),
  description: z.string().min(1, "Popis je povinný.").max(500),
  repoUrl: z.string().url("Neplatná URL.").or(z.literal("")).default(""),
  owners: z.array(z.string()).default([]),
  environmentIds: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
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
    const created = await createApplication(parsed.data);
    return NextResponse.json({ id: created.id, item: created }, { status: 201 });
  } catch (e) {
    if (e instanceof ApplicationStoreError) {
      return NextResponse.json({ error: e.message, code: e.code }, { status: 409 });
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
