import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByEmail, findUserById } from "@/data/users";
import type { User } from "@/lib/types";

const COOKIE = "qa_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 dní

export type Session = {
  userId: string;
  issuedAt: number;
};

function encode(session: Session): string {
  return Buffer.from(JSON.stringify(session)).toString("base64url");
}

function decode(raw: string): Session | null {
  try {
    return JSON.parse(Buffer.from(raw, "base64url").toString("utf-8")) as Session;
  } catch {
    return null;
  }
}

export async function signIn(email: string, _password: string): Promise<User | null> {
  // MVP: password se nekontroluje. V produkci nahradit bcrypt ověřením.
  const user = findUserByEmail(email);
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
  return findUserById(session.userId) ?? null;
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
