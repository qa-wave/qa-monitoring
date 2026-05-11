import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { readJson, writeJson } from "@/lib/storage";
import { DEMO_SEED_PASSWORD, users as seedUsers } from "@/data/users";
import type { PersonaKey, PublicUser, User, UserRole } from "@/lib/types";

const STORE_KEY = "users.json";
const BCRYPT_ROUNDS = 10;

// Záměrně žádný in-memory cache — v Next.js dev modu HMR vytváří víc
// modulových instancí, které by se mohly rozejít. Pro MVP stačí číst pokaždé.

async function readAll(): Promise<User[]> {
  const data = await readJson<User[]>(STORE_KEY, []);
  if (data.length === 0) {
    // Seed: zahashuj DEMO_SEED_PASSWORD pro každý fixture účet, ať je login
    // funkční v dev bez ručního setupu. Hash se počítá jednou při prvním
    // spuštění a uloží se.
    const hash = await bcrypt.hash(DEMO_SEED_PASSWORD, BCRYPT_ROUNDS);
    const seeded: User[] = seedUsers.map((u) => ({ ...u, passwordHash: hash }));
    await writeJson(STORE_KEY, seeded);
    return seeded;
  }
  return data;
}

async function writeAll(items: User[]): Promise<void> {
  await writeJson(STORE_KEY, items);
}

/** Odebere `passwordHash` před odesláním na klienta. */
export function toPublicUser(user: User): PublicUser {
  const { passwordHash: _hash, ...rest } = user;
  void _hash;
  return rest;
}

export async function listUsers(): Promise<User[]> {
  return readAll();
}

export async function listPublicUsers(): Promise<PublicUser[]> {
  const all = await readAll();
  return all.map(toPublicUser);
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const all = await readAll();
  return all.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: string): Promise<User | undefined> {
  const all = await readAll();
  return all.find((u) => u.id === id);
}

/** Ověří heslo proti bcrypt hashi. Vrací true pokud OK. */
export async function verifyPassword(user: User, password: string): Promise<boolean> {
  if (!user.passwordHash || user.passwordHash.length === 0) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export type CreateUserInput = {
  email: string;
  name: string;
  role: UserRole;
  personaPreference: PersonaKey;
  password: string;
};

export class UserStoreError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "UserStoreError";
  }
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const all = await readAll();
  if (all.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new UserStoreError("email_exists", "Uživatel s tímto e-mailem už existuje.");
  }
  if (!input.password || input.password.length < 6) {
    throw new UserStoreError(
      "password_too_short",
      "Heslo musí mít alespoň 6 znaků."
    );
  }
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const created: User = {
    id: `u-${randomUUID().slice(0, 8)}`,
    email: input.email.trim(),
    name: input.name.trim(),
    role: input.role,
    personaPreference: input.personaPreference,
    passwordHash,
  };
  await writeAll([...all, created]);
  return created;
}

export type UpdateUserInput = Partial<
  Pick<User, "name" | "role" | "personaPreference">
> & {
  /** Nové plain-text heslo; pokud je uvedeno, bude nahrazen hash. */
  password?: string;
};

export async function updateUser(
  id: string,
  patch: UpdateUserInput,
  actorId: string
): Promise<User> {
  const all = await readAll();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) throw new UserStoreError("not_found", "Uživatel neexistuje.");

  const current = all[idx];

  // Guard: admin nesmí degradovat sám sebe, pokud by zůstal systém bez admina.
  if (patch.role && patch.role !== current.role) {
    if (current.role === "admin" && patch.role !== "admin") {
      const admins = all.filter((u) => u.role === "admin");
      if (admins.length <= 1) {
        throw new UserStoreError(
          "last_admin",
          "Nemůžeš odebrat admin roli poslednímu administrátorovi."
        );
      }
      if (id === actorId) {
        throw new UserStoreError("self_demote", "Sama/sám sobě nemůžeš odebrat admin roli.");
      }
    }
  }

  const { password, ...rest } = patch;
  const next: User = { ...current, ...rest };
  if (password !== undefined) {
    if (password.length < 6) {
      throw new UserStoreError(
        "password_too_short",
        "Heslo musí mít alespoň 6 znaků."
      );
    }
    next.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  const copy = [...all];
  copy[idx] = next;
  await writeAll(copy);
  return next;
}

export async function deleteUser(id: string, actorId: string): Promise<void> {
  const all = await readAll();
  const target = all.find((u) => u.id === id);
  if (!target) throw new UserStoreError("not_found", "Uživatel neexistuje.");
  if (id === actorId) {
    throw new UserStoreError("self_delete", "Sám sebe smazat nemůžeš.");
  }
  if (target.role === "admin") {
    const admins = all.filter((u) => u.role === "admin");
    if (admins.length <= 1) {
      throw new UserStoreError(
        "last_admin",
        "Nemůžeš smazat posledního administrátora."
      );
    }
  }
  await writeAll(all.filter((u) => u.id !== id));
}

/** No-op v MVP — cache neudržujeme, jen pro zpětnou kompatibilitu testů. */
export function invalidateCache(): void {
  // Intentionally empty — testy si volají před dalšími čtením.
}
