import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { EmptyState } from "@/components/dashboard/EmptyState";

export default function ProductPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Produkt"
        description="KPI a produktové metriky (DAU/WAU, retence, funnely)."
      />
      <EmptyState
        icon={BarChart3}
        title="Napoj analytics"
        description="Přes Nastavení → Integrace napoj PostHog, Mixpanel nebo GA4 a zde se objeví dashboard."
      />
    </div>
  );
}
