import type { Environment } from "@/lib/types";

export const environments: Environment[] = [
  {
    id: "env-dev",
    name: "dev",
    slug: "dev",
    url: "https://dev.example.internal",
    region: "eu-central-1",
    color: "#64748b",
    isProduction: false,
    order: 1,
  },
  {
    id: "env-staging",
    name: "staging",
    slug: "staging",
    url: "https://staging.example.internal",
    region: "eu-central-1",
    color: "#0ea5e9",
    isProduction: false,
    order: 2,
  },
  {
    id: "env-preprod",
    name: "pre-prod",
    slug: "preprod",
    url: "https://preprod.example.com",
    region: "eu-central-1",
    color: "#8b5cf6",
    isProduction: false,
    order: 3,
  },
  {
    id: "env-prod",
    name: "prod",
    slug: "prod",
    url: "https://www.example.com",
    region: "eu-central-1",
    color: "#10b981",
    isProduction: true,
    order: 4,
  },
];

export function getEnvironmentBySlug(slug: string): Environment | undefined {
  return environments.find((e) => e.slug === slug);
}
