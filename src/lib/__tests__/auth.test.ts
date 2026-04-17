/**
 * @jest-environment node
 */
import { createHmac, timingSafeEqual } from "node:crypto";

// Testujeme interně: encode/decode stejnou logikou jako v src/lib/auth.ts.
// Reprodukujeme logiku místo exportu, protože auth.ts používá next/headers,
// které v jsdom prostředí není jednoduše dostupné.

const SECRET = "test-secret-value-32-bytes-long-!";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("base64url");
}

function encode(obj: unknown): string {
  const payload = Buffer.from(JSON.stringify(obj)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(raw: string): unknown | null {
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  const expected = sign(payload);
  try {
    const a = Buffer.from(signature, "base64url");
    const b = Buffer.from(expected, "base64url");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
  } catch {
    return null;
  }
}

describe("session cookie encoding", () => {
  it("round-trip encode/decode vrátí původní session", () => {
    const session = { userId: "u-1", issuedAt: 1_700_000_000_000 };
    const token = encode(session);
    expect(decode(token)).toEqual(session);
  });

  it("odmítne token s podvrženou payload", () => {
    const original = encode({ userId: "u-1", issuedAt: 1 });
    const [, sig] = original.split(".");
    const forgedPayload = Buffer.from(JSON.stringify({ userId: "u-2", issuedAt: 1 })).toString(
      "base64url"
    );
    const forged = `${forgedPayload}.${sig}`;
    expect(decode(forged)).toBeNull();
  });

  it("odmítne token bez podpisu", () => {
    const payload = Buffer.from(JSON.stringify({ userId: "u-1" })).toString("base64url");
    expect(decode(payload)).toBeNull();
  });

  it("odmítne nesmysly", () => {
    expect(decode("garbage")).toBeNull();
    expect(decode("")).toBeNull();
    expect(decode(".")).toBeNull();
  });
});
