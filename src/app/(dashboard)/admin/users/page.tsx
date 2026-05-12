import { PageHeader } from "@/components/dashboard/PageHeader";
import { getSessionUser, requirePermission } from "@/lib/auth";
import { listPublicUsers } from "@/lib/users/store";
import { UsersAdminClient } from "./UsersAdminClient";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requirePermission("users:view");
  // listPublicUsers() vrací uživatele bez passwordHash — bezpečné pro klienta.
  const [users, me, { t }] = await Promise.all([listPublicUsers(), getSessionUser(), getT()]);
  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.users.title}
        description={t.pages.users.description}
      />
      <UsersAdminClient initialUsers={users} currentUserId={me?.id ?? ""} />
    </div>
  );
}
