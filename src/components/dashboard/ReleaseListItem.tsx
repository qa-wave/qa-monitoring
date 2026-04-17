import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import type { Release } from "@/lib/types";

export function ReleaseListItem({ release }: { release: Release }) {
  return (
    <Link
      href={`/releases/${release.id}`}
      className="flex items-start justify-between gap-4 rounded-md border border-transparent px-2 py-2 hover:border-border hover:bg-accent/40"
    >
      <div className="flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{release.version}</span>
          {release.status === "rolled_back" ? (
            <Badge variant="danger">Rollbacknuto</Badge>
          ) : release.status === "draft" ? (
            <Badge variant="outline">Draft</Badge>
          ) : (
            <Badge variant="success">Released</Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{release.title}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5 text-xs text-muted-foreground">
        <span>{formatRelativeTime(release.createdAt)}</span>
        <span>{release.appIds.length} {release.appIds.length === 1 ? "aplikace" : "aplikací"}</span>
      </div>
    </Link>
  );
}
