import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({ email: null }));
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Neplatn\u00FD e-mail" }, { status: 400 });
  }
  // MVP: just log. In production, store in DB/Blob.
  console.log("[subscribe] New subscription:", email);
  return NextResponse.json({ ok: true, message: "Odb\u011Br nastaven." });
}
