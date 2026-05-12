import { z } from "zod";
import type { Deployment, PipelineRun } from "@/lib/types";
import type { ProviderCapability, ProviderDefinition, ProviderScope, ProviderTestResult } from "./types";
import { logger } from "@/lib/logger";

export const githubCredentialsSchema = z.object({
  owner: z.string().min(1, "GitHub owner (org nebo uživatel) je povinný"),
  repo: z.string().min(1, "GitHub repo je povinné"),
  token: z
    .string()
    .min(20, "Personal access token musí mít alespoň 20 znaků")
    .regex(/^gh[pousr]_/, "Token by měl začínat gh(p|o|u|s|r)_"),
  defaultBranch: z.string().optional(),
});

export type GitHubConfig = z.infer<typeof githubCredentialsSchema>;

interface WorkflowRunApi {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  event: string;
  status: string;
  conclusion: string | null;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  html_url: string;
  actor: { login: string };
}

interface WorkflowRunsResponse {
  workflow_runs: WorkflowRunApi[];
}

interface ReleaseApi {
  id: number;
  tag_name: string;
  name: string | null;
  body: string | null;
  created_at: string;
  published_at: string | null;
  html_url: string;
  author: { login: string } | null;
}

function mapPipelineStatus(run: WorkflowRunApi): PipelineRun["status"] {
  if (run.status === "queued") return "queued";
  if (run.status !== "completed") return "running";
  if (run.conclusion === "success") return "success";
  return "failed";
}

async function githubFetch(url: string, token: string): Promise<Response> {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "qa",
  };

  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, {
      headers,
      next: { revalidate: 60 },
    });

    // Check rate limit headers
    const remaining = res.headers.get("x-ratelimit-remaining");
    if (remaining !== null && parseInt(remaining) <= 5) {
      logger.warn("GitHub API rate limit low", {
        remaining: parseInt(remaining),
        url,
      });
    }

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("retry-after") ?? "5");
      logger.warn("GitHub API rate limited, retrying", {
        attempt,
        retryAfterSec: retryAfter,
        url,
      });
      await new Promise((r) => setTimeout(r, retryAfter * 1000));
      continue;
    }

    if (!res.ok) {
      throw new Error(
        `GitHub API ${res.status}: ${(await res.text()).slice(0, 200)}`
      );
    }

    return res;
  }

  throw new Error("GitHub API: max retries exceeded");
}

function createGitHubAdapter(config: GitHubConfig): ProviderCapability {
  const base = "https://api.github.com";

  async function call<T>(path: string): Promise<T> {
    const res = await githubFetch(`${base}${path}`, config.token);
    return (await res.json()) as T;
  }

  return {
    async fetchPipelineRuns(_scope: ProviderScope) {
      const data = await call<WorkflowRunsResponse>(
        `/repos/${config.owner}/${config.repo}/actions/runs?per_page=20`
      );
      return data.workflow_runs.map<PipelineRun>((run) => ({
        id: `gh-${run.id}`,
        appId: "", // Konkrétní mapping na appId řeší registry/UI
        envId: "",
        branch: run.head_branch,
        commitSha: run.head_sha.slice(0, 8),
        actor: run.actor?.login ?? "unknown",
        status: mapPipelineStatus(run),
        startedAt: run.run_started_at ?? run.created_at,
        durationSec: Math.max(
          1,
          Math.round(
            (new Date(run.updated_at).getTime() - new Date(run.run_started_at ?? run.created_at).getTime()) / 1000
          )
        ),
        url: run.html_url,
      }));
    },

    async fetchDeployments(_scope: ProviderScope) {
      const data = await call<ReleaseApi[]>(
        `/repos/${config.owner}/${config.repo}/releases?per_page=10`
      );
      return data.map<Deployment>((rel) => ({
        id: `ghr-${rel.id}`,
        appId: "",
        envId: "",
        version: rel.tag_name,
        commitSha: rel.tag_name,
        commitMessage: rel.name ?? rel.tag_name,
        status: "success",
        startedAt: rel.created_at,
        finishedAt: rel.published_at,
        actor: rel.author?.login ?? "unknown",
        durationSec: 0,
      }));
    },

    async testConnection(): Promise<ProviderTestResult> {
      const start = Date.now();
      try {
        await githubFetch(
          `${base}/repos/${config.owner}/${config.repo}`,
          config.token,
        );
        // githubFetch already throws on !res.ok (except 429 retries)
        return {
          ok: true,
          message: `Připojeno na ${config.owner}/${config.repo}.`,
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

export const githubProviderDefinition: ProviderDefinition<GitHubConfig> = {
  key: "github",
  kind: "vcs",
  sdlcStage: "code",
  label: "GitHub",
  labelCs: "GitHub (verzování + Actions)",
  description:
    "Reálné napojení na GitHub REST API — stahuje releasy a Actions workflow runs. Potřebuje fine-grained personal access token s právy `actions:read` a `contents:read`.",
  docsUrl: "https://docs.github.com/en/rest",
  credentialsSchema: githubCredentialsSchema,
  capabilities: ["fetchDeployments", "fetchPipelineRuns", "testConnection"],
  isReal: true,
  create: createGitHubAdapter,
};
