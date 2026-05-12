import { PageHeader } from "@/components/dashboard/PageHeader";
import { requirePermission } from "@/lib/auth";
import { listApplications } from "@/lib/applications/store";
import { AppsAdminClient } from "./AppsAdminClient";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminAppsPage() {
  await requirePermission("integrations:view");
  const [apps, { t }] = await Promise.all([listApplications(), getT()]);
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.adminApps.title}
        description={t.pages.adminApps.description}
      />
      <AppsAdminClient initialApps={apps} />
    </div>
  );
}
