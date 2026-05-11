import { z } from "zod";
import type { ErrorSummary } from "@/lib/types";
import type { ProviderCapability, ProviderDefinition, ProviderScope, ProviderTestResult } from "./types";

export const sentryCredentialsSchema = z.object({
  organization: z.string().min(1, "Sentry organization slug je povinný"),
  project: z.string().optional(),
  authToken: z
    .string()
    .min(20, "Sentry auth token musí mít alespoň 20 znaků"),
  baseUrl: z.string().url().optional(),
});

export type SentryConfig = z.infer<typeof sentryCredentialsSchema>;

interface SentryIssueApi {
  id: string;
  title: string;
  culprit: string;
  level: string;
  count: string;
  firstSeen: string;
  lastSeen: string;
  userCount: number;
  permalink: string;
  lastRelease?: {
    version: string;
  } | null;
}

interface SentryOrgApi {
  slug: string;
  name: string;
}

function mapSentryLevel(level: string): ErrorSummary["level"] {
  switch (level) {
    case "fatal":
      return "fatal";
    case "error":
      return "error";
    case "warning":
      return "warning";
    default:
      return "error";
  }
}

function createSentryAdapter(config: SentryConfig): ProviderCapability {
  const base = config.baseUrl?.replace(/\/+$/, "") || "https://sentry.io";
  const headers = {
    Authorization: `Bearer ${config.authToken}`,
  } as const;

  async function call<T>(path: string): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(
        `Sentry API ${path} selhalo: ${res.status} ${res.statusText}`
      );
    }
    return (await res.json()) as T;
  }

  return {
    async fetchErrors(_scope: ProviderScope) {
      const project = config.project;
      if (!project) {
        // Without a project slug we cannot query project-scoped issues
        return [];
      }

      const data = await call<SentryIssueApi[]>(
        `/api/0/projects/${config.organization}/${project}/issues/?query=is:unresolved&sort=freq&limit=20`
      );

      return data.map<ErrorSummary>((issue) => ({
        id: issue.id,
        appId: "",
        envId: "",
        title: issue.title,
        fingerprint: issue.culprit || "",
        level: mapSentryLevel(issue.level),
        count24h: Number(issue.count) || 0,
        firstSeen: issue.firstSeen,
        lastSeen: issue.lastSeen,
        usersAffected: issue.userCount ?? 0,
        release: issue.lastRelease?.version ?? "",
        url: issue.permalink,
      }));
    },

    async testConnection(): Promise<ProviderTestResult> {
      const start = Date.now();
      try {
        const res = await fetch(
          `${base}/api/0/organizations/${config.organization}/`,
          { headers, cache: "no-store" }
        );
        if (!res.ok) {
          const body = await res.text();
          return {
            ok: false,
            message: `Připojení selhalo: ${res.status} ${res.statusText} — ${body.slice(0, 200)}`,
            latencyMs: Date.now() - start,
          };
        }
        const data = (await res.json()) as SentryOrgApi;
        return {
          ok: true,
          message: `Připojeno k organizaci ${data.slug}.`,
          latencyMs: Date.now() - start,
        };
      } catch (e) {
        return {
          ok: false,
          message: `Výjimka: ${(e as Error).message}`,
          latencyMs: Date.now() - start,
        };
      }
    },
  };
}

export const sentryProviderDefinition: ProviderDefinition<SentryConfig> = {
  key: "sentry",
  kind: "errors",
  sdlcStage: "observe",
  label: "Sentry",
  labelCs: "Sentry (chyby)",
  description:
    "Reálné napojení na Sentry API — stahuje neresolved issues s počtem výskytů a affected users. Potřebuje auth token s oprávněním `project:read` a `event:read`.",
  docsUrl: "https://docs.sentry.io/api/",
  credentialsSchema: sentryCredentialsSchema,
  capabilities: ["fetchErrors", "testConnection"],
  isReal: true,
  create: createSentryAdapter,
};
