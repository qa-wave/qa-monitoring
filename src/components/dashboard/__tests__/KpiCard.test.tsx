import { render, screen } from "@testing-library/react";
import { KpiCard } from "../KpiCard";

describe("KpiCard", () => {
  it("renderuje label a hodnotu", () => {
    render(<KpiCard label="Uptime 30d" value="99,94 %" />);
    expect(screen.getByText("Uptime 30d")).toBeInTheDocument();
    expect(screen.getByText("99,94 %")).toBeInTheDocument();
  });

  it("zobrazuje delta a hint", () => {
    render(
      <KpiCard
        label="p95 latence"
        value="287"
        unit="ms"
        delta={{ value: "-12 ms", direction: "down", positive: true }}
        hint="proti 24 h"
      />
    );
    expect(screen.getByText("-12 ms")).toBeInTheDocument();
    expect(screen.getByText("proti 24 h")).toBeInTheDocument();
    expect(screen.getByText("ms")).toBeInTheDocument();
  });

  it("aplikuje status variantu do stylu borderu", () => {
    const { container } = render(<KpiCard label="Chyby" value="0,4 %" status="warn" />);
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toMatch(/status-warn/);
  });
});
