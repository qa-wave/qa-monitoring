import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByEmail, findUserById } from "@/lib/users/store";
import type { User } from "@/lib/types";

const COOKIE = "qa_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 dní

export type Session = {
  userId: string;
  issuedAt: number;
};

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    // V MVP padneme na jasný default, ať se dev nemusí trápit s env vars při
    // prvním spuštění. V produkci je env proměnná povinná — middleware na to
    // zatím neupozorňuje, ale v v1 přidáme startup check.
    return "dev-only-insecure-secret-change-me-please-32byte";
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

function encode(session: Session): string {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

function decode(raw: string): Session | null {
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = raw.slice(0, dot);
  const signature = raw.slice(dot + 1);
  const expected = sign(payload);
  try {
    const a = Buffer.from(signature, "base64url");
    const b = Buffer.from(expected, "base64url");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as Session;
  } catch {
    return null;
  }
}

export async function signIn(email: string, _password: string): Promise<User | null> {
  // MVP: password se nekontroluje. V produkci nahradit bcrypt ověřením.
  const user = await findUserByEmail(email);
  if (!user) return null;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE, encode({ userId: user.id, issuedAt: Date.now() }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  return user;
}

export async function signOut(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}

export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return null;
  const session = decode(raw);
  if (!session) return null;
  return (await findUserById(session.userId)) ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin(): Promise<User> {
  const user = await requireUser();
  if (user.role !== "admin") redirect("/");
  return user;
}

export const SESSION_COOKIE_NAME = COOKIE;
