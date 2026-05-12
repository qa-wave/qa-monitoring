import { z } from "zod";
import type { Deployment } from "@/lib/types";
import type { ProviderCapability, ProviderDefinition, ProviderScope, ProviderTestResult } from "./types";
import { logger } from "@/lib/logger";

export const vercelCredentialsSchema = z.object({
  token: z
    .string()
    .min(20, "Vercel API token musí mít alespoň 20 znaků"),
  projectId: z.string().optional(),
  teamId: z.string().optional(),
});

export type VercelConfig = z.infer<typeof vercelCredentialsSchema>;

interface VercelDeploymentMeta {
  githubCommitRef?: string;
  githubCommitSha?: string;
  githubCommitMessage?: string;
}

interface VercelDeploymentCreator {
  username?: string;
}

interface VercelDeploymentApi {
  uid: string;
  url: string;
  state:
    | "READY"
    | "ERROR"
    | "BUILDING"
    | "QUEUED"
    | "CANCELED"
    | "INITIALIZING";
  created: number;
  ready?: number;
  meta?: VercelDeploymentMeta;
  creator?: VercelDeploymentCreator;
}

interface VercelDeploymentsResponse {
  deployments: VercelDeploymentApi[];
}

interface VercelUserResponse {
  user: {
    username: string;
    name?: string;
  };
}

function mapDeploymentStatus(
  state: VercelDeploymentApi["state"]
): Deployment["status"] {
  switch (state) {
    case "READY":
      return "success";
    case "ERROR":
    case "CANCELED":
      return "failed";
    case "BUILDING":
    case "QUEUED":
    case "INITIALIZING":
      return "pending";
    default:
      return "pending";
  }
}

async function vercelFetch(url: string, token: string): Promise<Response> {
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    // Check rate limit headers
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining !== null && parseInt(remaining) <= 5) {
      logger.warn("Vercel API rate limit low", {
        remaining: parseInt(remaining),
        url,
      });
    }

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("retry-after") ?? "5");
      logger.warn("Vercel API rate limited, retrying", {
        attempt,
        retryAfterSec: retryAfter,
        url,
      });
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    if (!res.ok) {
      throw new Error(
        `Vercel API ${res.status}: ${(await res.text()).slice(0, 200)}`
      );
    }

    return res;
  }

  throw new Error("Vercel API: max retries exceeded");
}

function createVercelAdapter(config: VercelConfig): ProviderCapability {
  const base = "https://api.vercel.com";

  async function call<T>(path: string): Promise<T> {
    const res = await vercelFetch(`${base}${path}`, config.token);
    return (await res.json()) as T;
  }

  return {
    async fetchDeployments(_scope: ProviderScope) {
      const params = new URLSearchParams({ limit: "20" });
      if (config.projectId) params.set("projectId", config.projectId);
      if (config.teamId) params.set("teamId", config.teamId);

      const data = await call<VercelDeploymentsResponse>(
        `/v6/deployments?${params.toString()}`
      );

      return data.deployments.map<Deployment>((d) => {
        const createdMs = d.created;
        const readyMs = d.ready ?? null;
        return {
          id: d.uid,
          appId: "",
          envId: "",
          version: d.meta?.githubCommitRef || d.url,
          commitSha: d.meta?.githubCommitSha?.slice(0, 8) ?? "",
          commitMessage: d.meta?.githubCommitMessage ?? "",
          status: mapDeploymentStatus(d.state),
          startedAt: new Date(createdMs).toISOString(),
          finishedAt: readyMs ? new Date(readyMs).toISOString() : null,
          actor: d.creator?.username ?? "vercel",
          durationSec: readyMs
            ? Math.round((readyMs - createdMs) / 1000)
            : 0,
        };
      });
    },

    async testConnection(): Promise<ProviderTestResult> {
      const start = Date.now();
      try {
        const res = await vercelFetch(`${base}/v2/user`, config.token);
        const data = (await res.json()) as VercelUserResponse;
        return {
          ok: true,
          message: `Připojeno jako ${data.user.username}.`,
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

export const vercelProviderDefinition: ProviderDefinition<VercelConfig> = {
  key: "vercel",
  kind: "paas",
  sdlcStage: "release",
  label: "Vercel",
  labelCs: "Vercel (deploye)",
  description:
    "Reálné napojení na Vercel REST API — stahuje deploye a jejich stav. Potřebuje Vercel API token s přístupem k projektu.",
  docsUrl: "https://vercel.com/docs/rest-api",
  credentialsSchema: vercelCredentialsSchema,
  capabilities: ["fetchDeployments", "testConnection"],
  isReal: true,
  create: createVercelAdapter,
};
