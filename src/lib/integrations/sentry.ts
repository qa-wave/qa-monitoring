import { z } from "zod";
import type { ErrorSummary } from "@/lib/types";
import type { ProviderCapability, ProviderDefinition, ProviderScope, ProviderTestResult } from "./types";
import { logger } from "@/lib/logger";

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

async function sentryFetch(
  url: string,
  authToken: string,
): Promise<Response> {
  const headers = {
    Authorization: `Bearer ${authToken}`,
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    // Check rate limit headers
    const remaining = res.headers.get("x-sentry-rate-limit-remaining");
    if (remaining !== null && parseInt(remaining) <= 5) {
      logger.warn("Sentry API rate limit low", {
        remaining: parseInt(remaining),
        url,
      });
    }

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("retry-after") ?? "5");
      logger.warn("Sentry API rate limited, retrying", {
        attempt,
        retryAfterSec: retryAfter,
        url,
      });
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    if (!res.ok) {
      throw new Error(
        `Sentry API ${res.status}: ${(await res.text()).slice(0, 200)}`
      );
    }

    return res;
  }

  throw new Error("Sentry API: max retries exceeded");
}

function createSentryAdapter(config: SentryConfig): ProviderCapability {
  const base = config.baseUrl?.replace(/\/+$/, "") || "https://sentry.io";

  async function call<T>(path: string): Promise<T> {
    const res = await sentryFetch(`${base}${path}`, config.authToken);
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
        const res = await sentryFetch(
          `${base}/api/0/organizations/${config.organization}/`,
          config.authToken,
        );
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
