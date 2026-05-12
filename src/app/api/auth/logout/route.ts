import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export async function POST() {
  try {
    await signOut();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[auth/logout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
