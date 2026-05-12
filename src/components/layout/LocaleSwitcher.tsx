"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Locale, setLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();

  function switchLocale(locale: Locale) {
    if (locale === current) return;
    setLocale(locale);
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Jazyk / Language">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <DropdownMenuItem
          onClick={() => switchLocale("cs")}
          className={cn(
            "cursor-pointer",
            current === "cs" && "bg-accent",
          )}
        >
          CZ Cestina
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => switchLocale("en")}
          className={cn(
            "cursor-pointer",
            current === "en" && "bg-accent",
          )}
        >
          EN English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
