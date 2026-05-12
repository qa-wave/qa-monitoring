import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { findUserByEmail, findUserById, verifyPassword } from "@/lib/users/store";
import { getPermissionsForRole, hasPermission, type Permission } from "@/lib/rbac";
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
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SESSION_SECRET env variable is missing or too short (min 16 chars). " +
        "Set it before starting the production server.",
      );
    }
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

export async function signIn(email: string, password: string): Promise<User | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await verifyPassword(user, password);
  if (!ok) return null;

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
  cookieStore.set(COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
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

export async function requirePermission(permission: Permission): Promise<User> {
  const user = await requireUser();
  const permissions = getPermissionsForRole(user.role);
  if (!hasPermission(permissions, permission)) {
    redirect("/");
  }
  return user;
}

export const SESSION_COOKIE_NAME = COOKIE;
