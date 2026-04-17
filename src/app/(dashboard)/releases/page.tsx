import { PageHeader } from "@/components/dashboard/PageHeader";
import { ReleaseListItem } from "@/components/dashboard/ReleaseListItem";
import { Card, CardContent } from "@/components/ui/card";
import { releases } from "@/data/releases";

export default function ReleasesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Releasy"
        description="Časová osa releasů s propojenými PR a ticketami."
      />
      <Card>
        <CardContent className="divide-y divide-border/60 p-2">
          {releases.map((release) => (
            <ReleaseListItem key={release.id} release={release} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
