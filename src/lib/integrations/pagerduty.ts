import { z } from "zod";
import type { Incident } from "@/lib/types";
import type { ProviderCapability, ProviderDefinition, ProviderScope, ProviderTestResult } from "./types";

export const pagerdutyCredentialsSchema = z.object({
  routingKey: z.string().min(10, "PagerDuty API token je povinný"),
  serviceId: z.string().optional(),
});

export type PagerDutyConfig = z.infer<typeof pagerdutyCredentialsSchema>;

interface PdIncidentApi {
  id: string;
  title: string;
  description: string | null;
  urgency: "high" | "low";
  status: "triggered" | "acknowledged" | "resolved";
  created_at: string;
  last_status_change_at: string;
  html_url: string;
  service: {
    id: string;
    summary: string;
  };
  assignments: {
    assignee: {
      summary: string;
    };
  }[];
}

interface PdIncidentsResponse {
  incidents: PdIncidentApi[];
}

interface PdUserApi {
  user: {
    name: string;
    email: string;
  };
}

function mapSeverity(urgency: "high" | "low"): Incident["severity"] {
  return urgency === "high" ? "sev1" : "sev2";
}

function mapStatus(status: PdIncidentApi["status"]): Incident["status"] {
  switch (status) {
    case "triggered":
      return "open";
    case "acknowledged":
      return "investigating";
    case "resolved":
      return "resolved";
    default:
      return "open";
  }
}

function createPagerDutyAdapter(config: PagerDutyConfig): ProviderCapability {
  const base = "https://api.pagerduty.com";
  const headers = {
    Authorization: `Token token=${config.routingKey}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.pagerduty+json;version=2",
  } as const;

  async function call<T>(path: string): Promise<T> {
    const res = await fetch(`${base}${path}`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) {
      throw new Error(
        `PagerDuty API ${path} selhalo: ${res.status} ${res.statusText}`
      );
    }
    return (await res.json()) as T;
  }

  return {
    async fetchIncidents(_scope: ProviderScope) {
      let url = `/incidents?statuses[]=triggered&statuses[]=acknowledged&limit=20`;
      if (config.serviceId) {
        url += `&service_ids[]=${config.serviceId}`;
      }
      const data = await call<PdIncidentsResponse>(url);

      return data.incidents.map<Incident>((inc) => ({
        id: `pd-${inc.id}`,
        title: inc.title,
        description: inc.description ?? "",
        severity: mapSeverity(inc.urgency),
        status: mapStatus(inc.status),
        startedAt: inc.created_at,
        resolvedAt: inc.status === "resolved" ? inc.last_status_change_at : null,
        affectedAppIds: [],
        affectedEnvIds: [],
        isPublic: false,
        postmortemUrl: undefined,
        updates: inc.assignments.length > 0
          ? [
              {
                at: inc.last_status_change_at,
                author: inc.assignments[0].assignee.summary,
                message: `Status: ${inc.status}`,
              },
            ]
          : [],
      }));
    },

    async testConnection(): Promise<ProviderTestResult> {
      const start = Date.now();
      try {
        const res = await fetch(`${base}/users/me`, {
          headers,
          cache: "no-store",
        });
        if (!res.ok) {
          const body = await res.text();
          return {
            ok: false,
            message: `Připojení selhalo: ${res.status} ${res.statusText} — ${body.slice(0, 200)}`,
            latencyMs: Date.now() - start,
          };
        }
        const data = (await res.json()) as PdUserApi;
        return {
          ok: true,
          message: `Připojeno jako ${data.user.name} (${data.user.email}).`,
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

export const pagerdutyProviderDefinition: ProviderDefinition<PagerDutyConfig> = {
  key: "pagerduty",
  kind: "incidents",
  sdlcStage: "operate",
  label: "PagerDuty",
  labelCs: "PagerDuty (incidenty)",
  description:
    "Reálné napojení na PagerDuty REST API — stahuje triggered a acknowledged incidenty. Potřebuje API token s oprávněním pro čtení incidentů.",
  docsUrl: "https://developer.pagerduty.com/api-reference/",
  credentialsSchema: pagerdutyCredentialsSchema,
  capabilities: ["fetchIncidents", "testConnection"],
  isReal: true,
  create: createPagerDutyAdapter,
};
