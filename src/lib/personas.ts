import type { PersonaKey } from "@/lib/types";
import { Code2, Gauge, LayoutDashboard, TestTube2 } from "lucide-react";

export const personaLabel: Record<PersonaKey, string> = {
  all: "Všechno",
  dev: "Vývojář",
  po: "Product Owner",
  tester: "Tester",
};

export const personaDescription: Record<PersonaKey, string> = {
  all: "Všechny dostupné metriky a widgety bez filtru.",
  dev: "Stav buildů, deployů, chyb a infrastruktury.",
  po: "Releasy, feature flagy, KPI a roadmapa.",
  tester: "Výsledky testů a připravenost prostředí.",
};

export const personaIcon = {
  all: LayoutDashboard,
  dev: Code2,
  po: Gauge,
  tester: TestTube2,
} as const;

export const personaKeys: PersonaKey[] = ["all", "dev", "po", "tester"];

export function parsePersona(value: string | null | undefined): PersonaKey {
  if (value === "dev" || value === "po" || value === "tester" || value === "all") return value;
  return "dev";
}

/**
 * Určuje, které widgety na Přehledu se mají zvýraznit podle persony.
 */
export const personaWidgets: Record<PersonaKey, string[]> = {
  all: ["kpis", "matrix", "releases", "incidents", "tests", "flags", "errors"],
  dev: ["kpis", "matrix", "incidents", "errors", "deploys"],
  po: ["kpis", "releases", "flags", "incidents"],
  tester: ["kpis", "tests", "matrix", "incidents"],
};
