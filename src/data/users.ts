import type { User } from "@/lib/types";

/**
 * Defaultní heslo pro všechny seed demo účty. Při prvním seedu store.ts
 * přes bcrypt zahashuje a uloží do `.data/users.json`. V produkci by seed
 * neměl obsahovat známé heslo — je to jen dev-bootstrap.
 */
export const DEMO_SEED_PASSWORD = "demo";

export const users: User[] = [
  {
    id: "u-1",
    email: "viewer@example.com",
    name: "Viera Viewerová",
    role: "viewer",
    personaPreference: "dev",
  },
  {
    id: "u-2",
    email: "admin@example.com",
    name: "Admin Adminová",
    role: "admin",
    personaPreference: "all",
  },
  {
    id: "u-3",
    email: "tomas@example.com",
    name: "Tomáš Mertin",
    role: "admin",
    personaPreference: "dev",
  },
  {
    id: "u-4",
    email: "petra@example.com",
    name: "Petra Vývojářka",
    role: "viewer",
    personaPreference: "dev",
  },
  {
    id: "u-5",
    email: "po@example.com",
    name: "Pavel Produktový",
    role: "viewer",
    personaPreference: "po",
  },
  {
    id: "u-6",
    email: "tester@example.com",
    name: "Tereza Testerka",
    role: "viewer",
    personaPreference: "tester",
  },
];
