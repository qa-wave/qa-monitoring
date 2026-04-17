import type { PlannedMaintenance } from "@/lib/types";

export const plannedMaintenance: PlannedMaintenance[] = [
  {
    id: "mnt-1",
    title: "Aktualizace databáze",
    description:
      "Aktualizace Postgres z 16 na 17 s krátkou nedostupností zápisu. Čtení zůstane dostupné z read-replik.",
    startsAt: "2026-04-20T23:00:00+02:00",
    endsAt: "2026-04-21T01:00:00+02:00",
    affectedAppIds: ["app-api", "app-payments"],
    affectedEnvIds: ["env-prod"],
    isPublic: true,
  },
  {
    id: "mnt-2",
    title: "Obnovení certifikátu",
    description: "Rotace TLS certifikátu pro dev prostředí. Bez vlivu na produkci.",
    startsAt: "2026-04-22T08:00:00+02:00",
    endsAt: "2026-04-22T08:15:00+02:00",
    affectedAppIds: ["app-web", "app-api"],
    affectedEnvIds: ["env-dev"],
    isPublic: false,
  },
];
