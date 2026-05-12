"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toCSV, downloadCSV } from "@/lib/export";
import type { SecurityVulnerability } from "@/lib/types";

export function ExportVulnerabilities({
  data,
}: {
  data: SecurityVulnerability[];
}) {
  function handleExport() {
    const csv = toCSV(data, [
      { key: "severity", label: "Závažnost" },
      { key: "cve", label: "CVE" },
      { key: "package", label: "Balíček" },
      { key: "currentVersion", label: "Verze" },
      { key: "title", label: "Popis" },
      { key: "fixAvailable", label: "Fix" },
      { key: "discoveredAt", label: "Nalezeno" },
    ]);
    downloadCSV(csv, "vulnerabilities.csv");
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-1"
    >
      <Download className="h-4 w-4" /> Export CSV
    </Button>
  );
}
