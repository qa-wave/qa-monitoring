import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { users as seedUsers } from "@/data/users";
import type { PersonaKey, User, UserRole } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "users.json");

// Záměrně žádný in-memory cache — v Next.js dev modu HMR vytváří víc
// modulových instancí, které by se mohly rozejít. Pro MVP stačí číst pokaždé.

async function ensureFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(STORE_FILE);
  } catch {
    await fs.writeFile(STORE_FILE, JSON.stringify(seedUsers, null, 2), "utf-8");
  }
}

async function readAll(): Promise<User[]> {
  await ensureFile();
  const raw = await fs.readFile(STORE_FILE, "utf-8");
  try {
    return JSON.parse(raw) as User[];
  } catch {
    return [...seedUsers];
  }
}

async function writeAll(items: User[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(STORE_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function listUsers(): Promise<User[]> {
  return readAll();
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const all = await readAll();
  return all.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserById(id: string): Promise<User | undefined> {
  const all = await readAll();
  return all.find((u) => u.id === id);
}

export type CreateUserInput = {
  email: string;
  name: string;
  role: UserRole;
  personaPreference: PersonaKey;
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
  const created: User = {
    id: `u-${randomUUID().slice(0, 8)}`,
    email: input.email.trim(),
    name: input.name.trim(),
    role: input.role,
    personaPreference: input.personaPreference,
  };
  await writeAll([...all, created]);
  return created;
}

export type UpdateUserInput = Partial<Pick<User, "name" | "role" | "personaPreference">>;

export async function updateUser(
  id: string,
  patch: UpdateUserInput,
  actorId: string
): Promise<User> {
  const all = await readAll();
  const idx = all.findIndex((u) => u.id === id);
  if (idx === -1) throw new UserStoreError("not_found", "Uživatel neexistuje.");

  const current = all[idx];
  const next: User = { ...current, ...patch };

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
