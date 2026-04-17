"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function EnvFilter({
  environments,
  defaultSlug = "all",
}: {
  environments: { slug: string; name: string }[];
  defaultSlug?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("env") ?? defaultSlug;

  function select(value: string) {
    const params = new URLSearchParams(searchParams);
    if (value === "all") params.delete("env");
    else params.set("env", value);
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`);
  }

  const currentLabel =
    current === "all" ? "vše" : environments.find((e) => e.slug === current)?.name ?? current;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Globe className="h-4 w-4" />
          <span className="text-xs font-medium text-muted-foreground">Prostředí:</span>
          <span>{currentLabel}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Prostředí</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => select("all")}>
          vše {current === "all" ? <Check className="ml-auto h-4 w-4" /> : null}
        </DropdownMenuItem>
        {environments.map((e) => (
          <DropdownMenuItem key={e.slug} onSelect={() => select(e.slug)}>
            {e.name} {current === e.slug ? <Check className="ml-auto h-4 w-4" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
