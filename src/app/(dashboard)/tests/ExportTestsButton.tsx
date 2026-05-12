"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toCSV, downloadCSV } from "@/lib/export";
import type { TestRun } from "@/lib/types";

export function ExportTestsButton({ data }: { data: TestRun[] }) {
  function handleExport() {
    const csv = toCSV(data, [
      { key: "appId", label: "App" },
      { key: "suite", label: "Suite" },
      { key: "passed", label: "Passed" },
      { key: "failed", label: "Failed" },
      { key: "flaky", label: "Flaky" },
      { key: "coveragePct", label: "Coverage %" },
      { key: "status", label: "Status" },
      { key: "runAt", label: "Run At" },
    ]);
    downloadCSV(csv, "test-runs.csv");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
      <Download className="h-4 w-4" /> Export CSV
    </Button>
  );
}
