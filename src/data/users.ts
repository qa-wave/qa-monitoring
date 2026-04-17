import type { User } from "@/lib/types";

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

export function findUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}
