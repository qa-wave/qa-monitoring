import { render, screen } from "@testing-library/react";
import { StatusMatrix } from "../StatusMatrix";
import type { Application, Environment, HealthCheck } from "@/lib/types";

const envs: Environment[] = [
  {
    id: "env-dev",
    name: "dev",
    slug: "dev",
    url: "http://localhost",
    region: "eu-central-1",
    color: "#000",
    isProduction: false,
    order: 1,
  },
  {
    id: "env-prod",
    name: "prod",
    slug: "prod",
    url: "https://example.com",
    region: "eu-central-1",
    color: "#000",
    isProduction: true,
    order: 2,
  },
];

const apps: Application[] = [
  {
    id: "app-web",
    name: "web",
    slug: "web",
    description: "",
    repoUrl: "",
    language: "TS",
    owners: [],
    environmentIds: ["env-dev", "env-prod"],
    tags: [],
  },
];

const hcs: HealthCheck[] = [
  {
    id: "hc-1",
    appId: "app-web",
    envId: "env-dev",
    kind: "http",
    status: "ok",
    latencyMs: 100,
    uptimePct30d: 99.9,
    checkedAt: new Date().toISOString(),
  },
  {
    id: "hc-2",
    appId: "app-web",
    envId: "env-prod",
    kind: "http",
    status: "down",
    latencyMs: 0,
    uptimePct30d: 98.0,
    checkedAt: new Date().toISOString(),
  },
];

describe("StatusMatrix", () => {
  it("renderuje nadpis a jména aplikací a prostředí", () => {
    render(<StatusMatrix applications={apps} environments={envs} healthChecks={hcs} />);
    expect(screen.getByText("Prostředí × aplikace")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "web" })).toBeInTheDocument();
    // "prod" se objevuje v hlavičce sloupce i v badgi, tolerujeme více výskytů
    expect(screen.getAllByText("prod").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("dev")).toBeInTheDocument();
  });

  it("zobrazí latenci pro každou buňku s daty", () => {
    render(<StatusMatrix applications={apps} environments={envs} healthChecks={hcs} />);
    expect(screen.getByText(/100 ms/)).toBeInTheDocument();
  });

  it("renderuje status dot pro každou buňku", () => {
    const { container } = render(
      <StatusMatrix applications={apps} environments={envs} healthChecks={hcs} />
    );
    const dots = container.querySelectorAll("[role=\"img\"]");
    expect(dots.length).toBeGreaterThanOrEqual(2);
  });
});
