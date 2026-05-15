import { PageHeader } from "@/components/dashboard/PageHeader";
import { requireUser } from "@/lib/auth";
import { toPublicUser } from "@/lib/users/store";
import { ProfileClient } from "./ProfileClient";
import { getT } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const { t } = await getT();
  const publicUser = toPublicUser(user);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.pages.profile.title}
        description={t.pages.profile.description}
      />
      <ProfileClient user={publicUser} />
    </div>
  );
}
