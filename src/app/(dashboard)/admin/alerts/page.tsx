import { PageHeader } from "@/components/dashboard/PageHeader";
import { listAlertRules } from "@/lib/alerts/store";
import { requirePermission } from "@/lib/auth";
import { AlertsAdminClient } from "./AlertsAdminClient";

export default async function AlertsPage() {
  await requirePermission("alerts:manage");
  const rules = await listAlertRules();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pravidla alertů"
        description="Pravidla alertů na základě prahových hodnot."
      />
      <AlertsAdminClient initialRules={rules} />
    </div>
  );
}
