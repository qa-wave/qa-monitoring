import { z } from "zod";
import { deployments } from "@/data/deployments";
import { errorSummaries } from "@/data/errors";
import { featureFlags } from "@/data/feature-flags";
import { healthChecks } from "@/data/health-checks";
import { incidents } from "@/data/incidents";
import { pipelineRuns } from "@/data/pipeline-runs";
import { testRuns } from "@/data/test-runs";
import type { ProviderCapability, ProviderDefinition, ProviderKind } from "./types";

const mockCredentialsSchema = z.object({
  apiUrl: z.string().url().optional().or(z.literal("").optional()),
  apiToken: z.string().optional(),
});

type MockConfig = z.infer<typeof mockCredentialsSchema>;

function createMockAdapter(_config: MockConfig): ProviderCapability {
  return {
    async fetchDeployments({ appId, envId }) {
      return deployments.filter((d) => (!appId || d.appId === appId) && (!envId || d.envId === envId));
    },
    async fetchHealth({ appId, envId }) {
      return healthChecks.filter((h) => (!appId || h.appId === appId) && (!envId || h.envId === envId));
    },
    async fetchErrors({ appId, envId }) {
      return errorSummaries.filter(
        (e) => (!appId || e.appId === appId) && (!envId || e.envId === envId)
      );
    },
    async fetchPipelineRuns({ appId, envId }) {
      return pipelineRuns.filter(
        (p) => (!appId || p.appId === appId) && (!envId || p.envId === envId)
      );
    },
    async fetchFlags() {
      return featureFlags;
    },
    async fetchTestRuns({ appId, envId }) {
      return testRuns.filter((t) => (!appId || t.appId === appId) && (!envId || t.envId === envId));
    },
    async fetchIncidents({ appId, envId }) {
      return incidents.filter(
        (i) =>
          (!appId || i.affectedAppIds.includes(appId)) && (!envId || i.affectedEnvIds.includes(envId))
      );
    },
    async testConnection() {
      return { ok: true, message: "Mock připojení funguje (fixture data).", latencyMs: 3 };
    },
  };
}

type MockSpec = {
  key: string;
  kind: ProviderKind;
  label: string;
  labelCs: string;
  description: string;
  docsUrl: string;
  capabilities: (keyof ProviderCapability)[];
};

const mockSpecs: MockSpec[] = [
  {
    key: "sentry",
    kind: "errors",
    label: "Sentry",
    labelCs: "Sentry (chyby)",
    description: "Agregace chyb s rozlišením na nové/regresní a users affected.",
    docsUrl: "https://docs.sentry.io/api/",
    capabilities: ["fetchErrors", "testConnection"],
  },
  {
    key: "vercel",
    kind: "paas",
    label: "Vercel",
    labelCs: "Vercel (deploye)",
    description: "Deploye, náhledy PR, aktuální produkční revize.",
    docsUrl: "https://vercel.com/docs/rest-api",
    capabilities: ["fetchDeployments", "testConnection"],
  },
  {
    key: "kubernetes",
    kind: "k8s",
    label: "Kubernetes",
    labelCs: "Kubernetes",
    description: "Stav podů, rollouty, repliky.",
    docsUrl: "https://kubernetes.io/docs/concepts/overview/kubernetes-api/",
    capabilities: ["fetchHealth", "testConnection"],
  },
  {
    key: "datadog",
    kind: "apm",
    label: "Datadog",
    labelCs: "Datadog (APM)",
    description: "Latence, throughput, APM traces.",
    docsUrl: "https://docs.datadoghq.com/api/latest/",
    capabilities: ["fetchHealth", "testConnection"],
  },
  {
    key: "grafana",
    kind: "apm",
    label: "Grafana",
    labelCs: "Grafana (metriky)",
    description: "Dashboards a unified metrics přes Grafana API.",
    docsUrl: "https://grafana.com/docs/grafana/latest/developers/http_api/",
    capabilities: ["fetchHealth", "testConnection"],
  },
  {
    key: "pagerduty",
    kind: "incidents",
    label: "PagerDuty",
    labelCs: "PagerDuty (incidenty)",
    description: "Aktivní incidenty, on-call a MTTR.",
    docsUrl: "https://developer.pagerduty.com/api-reference/",
    capabilities: ["fetchIncidents", "testConnection"],
  },
  {
    key: "jira",
    kind: "tickets",
    label: "Jira",
    labelCs: "Jira (tickety)",
    description: "Burndown, bugy, sprint progress.",
    docsUrl: "https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/",
    capabilities: ["testConnection"],
  },
  {
    key: "linear",
    kind: "tickets",
    label: "Linear",
    labelCs: "Linear (tickety)",
    description: "Issues, cycles, projekty.",
    docsUrl: "https://developers.linear.app/docs",
    capabilities: ["testConnection"],
  },
  {
    key: "launchdarkly",
    kind: "flags",
    label: "LaunchDarkly",
    labelCs: "LaunchDarkly (feature flags)",
    description: "Flag stavy podle env a rollout procenta.",
    docsUrl: "https://apidocs.launchdarkly.com/",
    capabilities: ["fetchFlags", "testConnection"],
  },
  {
    key: "unleash",
    kind: "flags",
    label: "Unleash",
    labelCs: "Unleash (feature flags)",
    description: "Open-source feature flagy.",
    docsUrl: "https://docs.getunleash.io/",
    capabilities: ["fetchFlags", "testConnection"],
  },
  {
    key: "mixpanel",
    kind: "analytics",
    label: "Mixpanel",
    labelCs: "Mixpanel (produkt analytics)",
    description: "DAU/WAU, funnely, retence.",
    docsUrl: "https://developer.mixpanel.com/reference/overview",
    capabilities: ["testConnection"],
  },
  {
    key: "posthog",
    kind: "analytics",
    label: "PostHog",
    labelCs: "PostHog (produkt analytics)",
    description: "Události, funnely, feature flagy.",
    docsUrl: "https://posthog.com/docs/api",
    capabilities: ["testConnection"],
  },
  {
    key: "playwright-cloud",
    kind: "tests",
    label: "Playwright Cloud",
    labelCs: "Playwright Cloud (testy)",
    description: "Výsledky E2E testů v cloudu.",
    docsUrl: "https://playwright.dev/",
    capabilities: ["fetchTestRuns", "testConnection"],
  },
  {
    key: "snyk",
    kind: "security",
    label: "Snyk",
    labelCs: "Snyk (bezpečnost)",
    description: "CVE, závislosti, kontejner scan.",
    docsUrl: "https://docs.snyk.io/snyk-api/",
    capabilities: ["testConnection"],
  },
  {
    key: "uptimerobot",
    kind: "uptime",
    label: "UptimeRobot",
    labelCs: "UptimeRobot (uptime)",
    description: "Public uptime checks a response time.",
    docsUrl: "https://uptimerobot.com/api/",
    capabilities: ["fetchHealth", "testConnection"],
  },
  {
    key: "slack",
    kind: "comm",
    label: "Slack",
    labelCs: "Slack (komunikace)",
    description: "Broadcast bannerů, incident notifikace.",
    docsUrl: "https://api.slack.com/",
    capabilities: ["testConnection"],
  },
];

export function buildMockProviderDefinitions(): ProviderDefinition<MockConfig>[] {
  return mockSpecs.map((spec) => ({
    key: spec.key,
    kind: spec.kind,
    label: spec.label,
    labelCs: spec.labelCs,
    description: spec.description,
    docsUrl: spec.docsUrl,
    credentialsSchema: mockCredentialsSchema,
    capabilities: spec.capabilities,
    isReal: false,
    create: createMockAdapter,
  }));
}
