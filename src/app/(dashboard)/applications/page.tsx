import { PageHeader } from "@/components/dashboard/PageHeader";
import { applications } from "@/data/applications";
import { environments } from "@/data/environments";
import { healthChecks } from "@/data/health-checks";
import { getT } from "@/lib/i18n/server";
import { AppsClient } from "./AppsClient";

export default async function ApplicationsPage() {
  const { t } = await getT();
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.applications.title}
        description={t.pages.applications.description}
      />
      <AppsClient
        applications={applications}
        environments={environments}
        healthChecks={healthChecks}
      />
    </div>
  );
}
