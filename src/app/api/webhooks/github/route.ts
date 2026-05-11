import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const event = req.headers.get("x-github-event") ?? "unknown";
  const signature = req.headers.get("x-hub-signature-256");
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (secret && signature) {
    const expected =
      "sha256=" + createHmac("sha256", secret).update(body).digest("hex");
    // Constant-time comparison to prevent timing attacks
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expBuf.length ||
      !timingSafeEqual(sigBuf, expBuf)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  console.log(`[webhook/github] event=${event}`);

  return NextResponse.json({ ok: true, event });
}
