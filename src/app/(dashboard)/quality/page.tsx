import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ShieldCheck } from "lucide-react";

export default function QualityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Kvalita & bezpečnost"
        description="Tech-debt skóre, závislosti, CVE a statický audit — přichází v dalších iteracích."
      />
      <EmptyState
        icon={ShieldCheck}
        title="Zatím bez integrace"
        description="Napoj Snyk, SonarQube nebo GitHub Advanced Security v Nastavení → Integrace."
      />
    </div>
  );
}
