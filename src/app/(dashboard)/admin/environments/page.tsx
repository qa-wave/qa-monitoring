import { PageHeader } from "@/components/dashboard/PageHeader";
import { requirePermission } from "@/lib/auth";
import { listEnvironments } from "@/lib/environments/store";
import { EnvsAdminClient } from "./EnvsAdminClient";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminEnvsPage() {
  await requirePermission("integrations:view");
  const [envs, { t }] = await Promise.all([listEnvironments(), getT()]);
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.adminEnvs.title}
        description={t.pages.adminEnvs.description}
      />
      <EnvsAdminClient initialEnvs={envs} />
    </div>
  );
}
