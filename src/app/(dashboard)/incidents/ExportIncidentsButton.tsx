"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toCSV, downloadCSV } from "@/lib/export";
import type { Incident } from "@/lib/types";

export function ExportIncidentsButton({ data }: { data: Incident[] }) {
  function handleExport() {
    const csv = toCSV(data, [
      { key: "title", label: "Title" },
      { key: "severity", label: "Severity" },
      { key: "status", label: "Status" },
      { key: "startedAt", label: "Started At" },
      { key: "resolvedAt", label: "Resolved At" },
      { key: "affectedAppIds", label: "Affected Apps" },
    ]);
    downloadCSV(csv, "incidents.csv");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-1">
      <Download className="h-4 w-4" /> Export CSV
    </Button>
  );
}
