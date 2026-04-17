import { z } from "zod";
import type {
  Deployment,
  ErrorSummary,
  FeatureFlag,
  HealthCheck,
  Incident,
  PipelineRun,
  TestRun,
} from "@/lib/types";

/**
 * Kategorie, pod kterými uživatel v admin UI filtruje poskytovatele.
 */
export type ProviderKind =
  | "vcs"
  | "ci"
  | "paas"
  | "k8s"
  | "apm"
  | "errors"
  | "logs"
  | "incidents"
  | "tickets"
  | "flags"
  | "analytics"
  | "tests"
  | "security"
  | "uptime"
  | "db"
  | "comm";

export const providerKindLabel: Record<ProviderKind, string> = {
  vcs: "Verzování",
  ci: "CI/CD",
  paas: "Cloud / PaaS",
  k8s: "Kubernetes",
  apm: "APM / tracing",
  errors: "Chyby",
  logs: "Logy",
  incidents: "Incidenty",
  tickets: "Tickety",
  flags: "Feature flags",
  analytics: "Produkt analytics",
  tests: "Testovací platformy",
  security: "Bezpečnost",
  uptime: "Uptime / synthetic",
  db: "DB / kvalita dat",
  comm: "Komunikace",
};

/**
 * Parametry, se kterými adapter volá externí službu.
 */
export interface ProviderScope {
  appId?: string;
  envId?: string;
  since?: string;
  limit?: number;
}

/**
 * Funkcionalita, kterou adapter umí. Všechny metody jsou volitelné — každý
 * provider implementuje jen to, co skutečně z externí služby umí získat.
 */
export interface ProviderCapability {
  fetchDeployments?(scope: ProviderScope): Promise<Deployment[]>;
  fetchHealth?(scope: ProviderScope): Promise<HealthCheck[]>;
  fetchErrors?(scope: ProviderScope): Promise<ErrorSummary[]>;
  fetchPipelineRuns?(scope: ProviderScope): Promise<PipelineRun[]>;
  fetchFlags?(scope: ProviderScope): Promise<FeatureFlag[]>;
  fetchTestRuns?(scope: ProviderScope): Promise<TestRun[]>;
  fetchIncidents?(scope: ProviderScope): Promise<Incident[]>;
  testConnection(): Promise<ProviderTestResult>;
}

export interface ProviderTestResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
}

/**
 * Deklarace providera v registry (bez credentials). Admin vidí tento seznam
 * v UI a vytváří z něj konkrétní instance.
 */
export interface ProviderDefinition<TConfig = unknown> {
  key: string;
  kind: ProviderKind;
  label: string;
  labelCs: string;
  description: string;
  docsUrl: string;
  /** Schema pro validaci credentials od adminu. */
  credentialsSchema: z.ZodType<TConfig>;
  /** Výčet capability metod, které provider podporuje — jen pro UI. */
  capabilities: (keyof ProviderCapability)[];
  /** Zda jde o reálný adapter (MVP) vs. mock. */
  isReal: boolean;
  /** Factory pro vytvoření instance. */
  create: (config: TConfig) => ProviderCapability;
}

export const providerRegistrySymbol = Symbol.for("qa-app.providerRegistry");
