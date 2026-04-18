import { PageHeader } from "@/components/dashboard/PageHeader";
import { getSessionUser } from "@/lib/auth";
import { listUsers } from "@/lib/users/store";
import { UsersAdminClient } from "./UsersAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [users, me] = await Promise.all([listUsers(), getSessionUser()]);
  return (
    <div className="space-y-6">
      <PageHeader
        title="Uživatelé a role"
        description="Spravuj, kdo se kam dostane. Role viewer vidí dashboard, role admin má navíc přístup do Nastavení."
      />
      <UsersAdminClient initialUsers={users} currentUserId={me?.id ?? ""} />
    </div>
  );
}
