"use client";
import * as React from "react";
import { Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { STYLE_KEYS, type StyleKey } from "@/lib/branding/types";
import { STYLE_PRESETS } from "@/lib/branding/styles";
import { cn } from "@/lib/utils";

const darkThemes: StyleKey[] = ["noir", "terminal", "glass", "neon", "ember"];

export function ThemeSwitcher({ current }: { current: StyleKey }) {
  const [active, setActive] = React.useState<StyleKey>(current);
  function switchTheme(style: StyleKey) {
    if (style === active) return;
    const html = document.documentElement;
    STYLE_KEYS.forEach((k) => html.classList.remove(`theme-${k}`));
    html.classList.add(`theme-${style}`);
    if (darkThemes.includes(style)) { html.classList.add("dark"); } else { html.classList.remove("dark"); }
    setActive(style);
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Přepnout vizuální styl">
          <Paintbrush className="h-4.5 w-4.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        {STYLE_KEYS.map((key) => {
          const preset = STYLE_PRESETS[key];
          const isActive = key === active;
          return (
            <DropdownMenuItem key={key} onClick={() => switchTheme(key)} className={cn("flex items-center gap-3 cursor-pointer", isActive && "bg-accent")}>
              <div className="flex-1">
                <div className="text-sm font-medium">{preset.label}</div>
                <div className="text-[10px] text-muted-foreground">{preset.tagline}</div>
              </div>
              {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--brand-primary))]" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
