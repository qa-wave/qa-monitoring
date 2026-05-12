import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Navigace" className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      {items.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
          {crumb.href ? (
            <Link href={crumb.href} className="max-w-[200px] truncate hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="max-w-[200px] truncate text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
