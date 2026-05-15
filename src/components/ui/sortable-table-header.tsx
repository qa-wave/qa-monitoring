import Link from "next/link";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface SortableTableHeaderProps {
  /** Column key used in the URL `sort` param */
  column: string;
  /** Display label */
  label: string;
  /** Current active sort column */
  currentSort: string;
  /** Current sort direction */
  currentDir: "asc" | "desc";
  /** Base path for the link (e.g. "/quality") */
  basePath: string;
  /** Extra search params to preserve */
  extraParams?: Record<string, string>;
  /** Right-aligned text (e.g. for numeric columns) */
  align?: "left" | "right";
  /** Additional className for the th */
  className?: string;
}

export function SortableTableHeader({
  column,
  label,
  currentSort,
  currentDir,
  basePath,
  extraParams,
  align = "left",
  className = "",
}: SortableTableHeaderProps) {
  const isActive = currentSort === column;
  // If clicking the active column, toggle direction; otherwise default to asc
  const nextDir = isActive && currentDir === "asc" ? "desc" : "asc";

  const params = new URLSearchParams({
    ...extraParams,
    sort: column,
    dir: nextDir,
  });

  return (
    <th
      className={`pb-2 pr-3 ${align === "right" ? "text-right" : ""} ${className}`}
    >
      <Link
        href={`${basePath}?${params.toString()}`}
        className={`group inline-flex items-center gap-1 hover:text-foreground transition-colors ${
          isActive ? "text-foreground" : ""
        }`}
      >
        {label}
        {isActive ? (
          currentDir === "asc" ? (
            <ChevronUp className="size-3.5" />
          ) : (
            <ChevronDown className="size-3.5" />
          )
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
        )}
      </Link>
    </th>
  );
}
