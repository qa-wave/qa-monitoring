"use client";
import * as React from "react";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardGridProps {
  children: React.ReactNode[];
  storageKey?: string;
}

export function DashboardGrid({ children, storageKey = "zornik-widget-order" }: DashboardGridProps) {
  const [order, setOrder] = React.useState<number[]>(() => {
    if (typeof window === "undefined") return children.map((_, i) => i);
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as number[];
        if (parsed.length === children.length) return parsed;
      }
    } catch {
      /* noop */
    }
    return children.map((_, i) => i);
  });

  const [dragIndex, setDragIndex] = React.useState<number | null>(null);
  const [overIndex, setOverIndex] = React.useState<number | null>(null);

  function handleDragStart(idx: number) {
    setDragIndex(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setOverIndex(idx);
  }

  function handleDrop(idx: number) {
    if (dragIndex === null || dragIndex === idx) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const newOrder = [...order];
    const [moved] = newOrder.splice(dragIndex, 1);
    newOrder.splice(idx, 0, moved);
    setOrder(newOrder);
    localStorage.setItem(storageKey, JSON.stringify(newOrder));
    setDragIndex(null);
    setOverIndex(null);
  }

  function handleDragEnd() {
    setDragIndex(null);
    setOverIndex(null);
  }

  // Filter out invalid indices
  const validOrder = order.filter((i) => i >= 0 && i < children.length);

  return (
    <div className="space-y-6" role="list">
      {validOrder.map((childIdx, displayIdx) => (
        <div
          key={childIdx}
          role="listitem"
          draggable
          aria-label="Přeřadit widget"
          onDragStart={() => handleDragStart(displayIdx)}
          onDragOver={(e) => handleDragOver(e, displayIdx)}
          onDrop={() => handleDrop(displayIdx)}
          onDragEnd={handleDragEnd}
          className={cn(
            "group relative transition-opacity",
            dragIndex === displayIdx && "opacity-50",
            overIndex === displayIdx && dragIndex !== displayIdx && "border-t-2 border-[hsl(var(--brand-primary))]"
          )}
        >
          <div className="absolute -left-6 top-2 hidden cursor-grab opacity-0 transition-opacity group-hover:opacity-40 lg:block" title="Přetáhni pro změnu pořadí (pouze desktop)">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          {children[childIdx]}
        </div>
      ))}
    </div>
  );
}
