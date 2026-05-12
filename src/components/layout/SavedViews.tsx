"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

interface SavedView {
  id: string;
  name: string;
  params: Record<string, string>;
}

const STORAGE_KEY = "zornik-saved-views";

export function SavedViews() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [views, setViews] = React.useState<SavedView[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });

  function saveView() {
    const name = prompt("Název pohledu:");
    if (!name) return;
    const params: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      params[k] = v;
    });
    const view: SavedView = { id: Math.random().toString(36).slice(2), name, params };
    const updated = [...views, view];
    setViews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  function loadView(view: SavedView) {
    const sp = new URLSearchParams(view.params);
    router.push(`/?${sp.toString()}`);
  }

  function deleteView(id: string) {
    const updated = views.filter((v) => v.id !== id);
    setViews(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Saved views">
          <Bookmark className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {views.length === 0 ? (
          <div className="px-3 py-2 text-xs text-muted-foreground">No saved views</div>
        ) : (
          views.map((view) => (
            <DropdownMenuItem key={view.id} className="flex items-center justify-between">
              <span className="cursor-pointer flex-1" onClick={() => loadView(view)}>
                {view.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteView(view.id);
                }}
                className="ml-2 opacity-50 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={saveView} className="gap-2 cursor-pointer">
          <Plus className="h-3.5 w-3.5" /> Save current view
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
