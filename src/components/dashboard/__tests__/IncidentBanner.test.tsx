import { render, screen } from "@testing-library/react";
import { IncidentBanner } from "../IncidentBanner";
import type { Incident } from "@/lib/types";

const incident: Incident = {
  id: "inc-1",
  title: "Worker v prod neprovádí úlohy",
  description: "...",
  severity: "sev1",
  status: "investigating",
  startedAt: new Date(Date.now() - 12 * 60_000).toISOString(),
  resolvedAt: null,
  affectedAppIds: ["app-worker"],
  affectedEnvIds: ["env-prod"],
  isPublic: true,
  updates: [{ at: new Date().toISOString(), author: "pager", message: "alert" }],
};

describe("IncidentBanner", () => {
  it("renderuje titulek a severity", () => {
    render(<IncidentBanner incident={incident} />);
    expect(screen.getByText(/Worker v prod neprovádí úlohy/)).toBeInTheDocument();
    expect(screen.getByText(/SEV1/)).toBeInTheDocument();
  });

  it("odkazuje na detail", () => {
    render(<IncidentBanner incident={incident} />);
    const link = screen.getByRole("link", { name: /detail/i });
    expect(link).toHaveAttribute("href", "/incidents/inc-1");
  });

  it("má roli alert pro přístupnost", () => {
    render(<IncidentBanner incident={incident} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
