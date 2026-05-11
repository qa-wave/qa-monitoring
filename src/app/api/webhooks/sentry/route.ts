import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const resource = req.headers.get("sentry-hook-resource") ?? "unknown";
  const signature = req.headers.get("sentry-hook-signature");
  const secret = process.env.SENTRY_WEBHOOK_SECRET;

  if (secret && signature) {
    const expected = createHmac("sha256", secret).update(body).digest("hex");
    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expBuf.length ||
      !timingSafeEqual(sigBuf, expBuf)
    ) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  console.log(`[webhook/sentry] resource=${resource}`);

  return NextResponse.json({ ok: true, resource });
}
