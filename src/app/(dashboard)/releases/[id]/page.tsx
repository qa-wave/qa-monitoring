import { notFound } from "next/navigation";
import { releases } from "@/data/releases";
import { listApplications } from "@/lib/applications/store";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime, formatRelativeTime } from "@/lib/utils";
import { GitPullRequest, Clock, Boxes } from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const release = releases.find((r) => r.id === id);
  return { title: release?.title ?? "Release" };
}

export default async function ReleaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const release = releases.find((r) => r.id === id);
  if (!release) return notFound();

  const applications = await listApplications();
  const appMap = new Map(applications.map((a) => [a.id, a]));

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Releasy", href: "/releases" }, { label: release.title }]} />
      <PageHeader
        title={`${release.version} — ${release.title}`}
        description={`Vytvořeno ${formatRelativeTime(release.createdAt)}`}
        actions={
          <Badge variant={release.status === "released" ? "success" : release.status === "rolled_back" ? "danger" : "outline"}>
            {release.status === "released" ? "Released" : release.status === "rolled_back" ? "Rolled back" : "Draft"}
          </Badge>
        }
      />

      <Card>
        <CardHeader><CardTitle>Release notes</CardTitle></CardHeader>
        <CardContent className="pt-0 text-sm whitespace-pre-wrap">{release.notes}</CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Boxes className="h-4 w-4" /> Aplikace ({release.appIds.length})</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {release.appIds.map((id) => {
                const app = appMap.get(id);
                return <Badge key={id} variant="outline">{app?.name ?? id}</Badge>;
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><GitPullRequest className="h-4 w-4" /> Propojene PR a issues</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0 text-sm">
            {release.linkedPrIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {release.linkedPrIds.map((pr) => (
                  <Badge key={pr} variant="info">{pr}</Badge>
                ))}
              </div>
            )}
            {release.linkedIssueIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {release.linkedIssueIds.map((issue) => (
                  <Badge key={issue} variant="outline">{issue}</Badge>
                ))}
              </div>
            )}
            {release.linkedPrIds.length === 0 && release.linkedIssueIds.length === 0 && (
              <p className="text-muted-foreground">Zadne propojene PR ani issues.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-4 w-4" /> Detail</CardTitle></CardHeader>
        <CardContent className="space-y-2 pt-0 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Vytvorzeno</span><span>{formatDateTime(release.createdAt)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Verze</span><span className="font-mono">{release.version}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Prostredi</span><span>{release.environmentIds.length}</span></div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stav</span>
            <Badge variant={release.status === "released" ? "success" : release.status === "rolled_back" ? "danger" : "outline"}>{release.status}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
