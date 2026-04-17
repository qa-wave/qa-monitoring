"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { personaIcon, personaKeys, personaLabel, parsePersona } from "@/lib/personas";
import type { PersonaKey } from "@/lib/types";

export function PersonaFilter({ defaultPersona }: { defaultPersona: PersonaKey }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = parsePersona(searchParams.get("persona") ?? defaultPersona);
  const Icon = personaIcon[current];

  function select(p: PersonaKey) {
    const params = new URLSearchParams(searchParams);
    params.set("persona", p);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Icon className="h-4 w-4" />
          <span className="text-xs font-medium text-muted-foreground">Persona:</span>
          <span>{personaLabel[current]}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filtrovat podle role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {personaKeys.map((p) => {
          const ItemIcon = personaIcon[p];
          return (
            <DropdownMenuItem key={p} onSelect={() => select(p)} className="gap-2">
              <ItemIcon className="h-4 w-4" />
              <span className="flex-1">{personaLabel[p]}</span>
              {current === p ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
