export type StatusKind = "ok" | "warn" | "down" | "info" | "muted" | "pending";

export type Severity = "sev1" | "sev2" | "sev3";

export type PersonaKey = "all" | "dev" | "po" | "tester";

export type UserRole = "viewer" | "admin";

export interface Environment {
  id: string;
  name: string;
  slug: string;
  url: string;
  region: string;
  color: string;
  isProduction: boolean;
  order: number;
}

export interface Application {
  id: string;
  name: string;
  slug: string;
  description: string;
  repoUrl: string;
  language: string;
  owners: string[];
  environmentIds: string[];
  tags: string[];
}

export interface Deployment {
  id: string;
  appId: string;
  envId: string;
  version: string;
  commitSha: string;
  commitMessage: string;
  status: "success" | "failed" | "pending" | "rolled_back";
  startedAt: string;
  finishedAt: string | null;
  actor: string;
  durationSec: number;
}

export interface HealthCheck {
  id: string;
  appId: string;
  envId: string;
  kind: "http" | "tcp" | "synthetic";
  status: StatusKind;
  latencyMs: number;
  uptimePct30d: number;
  checkedAt: string;
  message?: string;
}

export interface Release {
  id: string;
  version: string;
  title: string;
  notes: string;
  createdAt: string;
  appIds: string[];
  environmentIds: string[];
  linkedPrIds: string[];
  linkedIssueIds: string[];
  status: "draft" | "released" | "rolled_back";
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: "open" | "investigating" | "monitoring" | "resolved";
  startedAt: string;
  resolvedAt: string | null;
  affectedAppIds: string[];
  affectedEnvIds: string[];
  isPublic: boolean;
  postmortemUrl?: string;
  updates: {
    at: string;
    author: string;
    message: string;
  }[];
}

export type TestSuite = "unit" | "integration" | "e2e" | "smoke" | "load";

export interface TestRun {
  id: string;
  appId: string;
  envId: string;
  suite: TestSuite;
  passed: number;
  failed: number;
  flaky: number;
  coveragePct: number | null;
  durationSec: number;
  runAt: string;
  reportUrl: string;
  status: StatusKind;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  envStates: {
    envId: string;
    on: boolean;
    rolloutPct: number;
  }[];
  updatedAt: string;
  updatedBy: string;
}

export interface PipelineRun {
  id: string;
  appId: string;
  envId: string;
  branch: string;
  commitSha: string;
  actor: string;
  status: "running" | "success" | "failed" | "queued";
  startedAt: string;
  durationSec: number;
  url: string;
}

export interface ErrorSummary {
  id: string;
  appId: string;
  envId: string;
  title: string;
  fingerprint: string;
  level: "error" | "warning" | "fatal";
  count24h: number;
  firstSeen: string;
  lastSeen: string;
  usersAffected: number;
  release: string;
  url: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  action: string;
  target: string;
  envId?: string;
  appId?: string;
  details?: string;
}

export interface PlannedMaintenance {
  id: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt: string;
  affectedAppIds: string[];
  affectedEnvIds: string[];
  isPublic: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  personaPreference: PersonaKey;
  avatarUrl?: string;
  /**
   * Bcrypt hash hesla. Na klienta se nikdy neposílá — API ho před odesláním
   * strip-uje v `toPublicUser()`. Volitelné jen pro zpětnou kompatibilitu se
   * staršími fixturami; při signIn se uživatel bez hashe **nepřihlásí**.
   */
  passwordHash?: string;
}

/** Verze User bezpečná pro odeslání klientovi (bez hashe). */
export type PublicUser = Omit<User, "passwordHash">;

export interface SecurityVulnerability {
  id: string;
  appId: string;
  package: string;
  currentVersion: string;
  fixedVersion: string | null;
  severity: "critical" | "high" | "medium" | "low";
  cve: string;
  title: string;
  fixAvailable: boolean;
  discoveredAt: string;
}

export interface IntegrationConfig {
  id: string;
  providerKey: string;
  displayName: string;
  credentials: Record<string, string>;
  scope: {
    appIds?: string[];
    envIds?: string[];
  };
  enabled: boolean;
  createdAt: string;
  createdBy: string;
  lastTestedAt: string | null;
  lastTestResult: "ok" | "error" | "pending" | null;
  lastTestMessage?: string;
}
