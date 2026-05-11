"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, LayoutDashboard, MoreHorizontal, TestTube2, Rocket, Globe, Boxes, ShieldCheck, BarChart3, Activity, Settings, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { UserRole } from "@/lib/types";

type Item = { href: string; label: string; icon: React.ElementType; adminOnly?: boolean };

const mainItems: Item[] = [
  { href: "/", label: "Přehled", icon: LayoutDashboard },
  { href: "/incidents", label: "Incidenty", icon: AlertTriangle },
  { href: "/tests", label: "Testy", icon: TestTube2 },
];

const moreItems: Item[] = [
  { href: "/releases", label: "Releasy", icon: Rocket },
  { href: "/environments", label: "Prostředí", icon: Globe },
  { href: "/applications", label: "Aplikace", icon: Boxes },
  { href: "/quality", label: "Kvalita & bezpečnost", icon: ShieldCheck },
  { href: "/product", label: "Produkt", icon: BarChart3 },
  { href: "/status/preview", label: "Veřejný status", icon: Activity },
  { href: "/admin/integrations", label: "Integrace", icon: Settings, adminOnly: true },
  { href: "/admin/branding", label: "Vzhled", icon: Palette, adminOnly: true },
];

export function MobileBottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const visibleMore = moreItems.filter((i) => !i.adminOnly || role === "admin");
  const isMoreActive = visibleMore.some((it) => it.href === "/" ? pathname === "/" : pathname.startsWith(it.href));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-background/95 backdrop-blur lg:hidden">
      {mainItems.map((it) => {
        const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs",
              active ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {it.label}
          </Link>
        );
      })}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs",
              isMoreActive ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <MoreHorizontal className="h-5 w-5" />
            Více
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 mb-2">
          {visibleMore.map((it) => {
            const Icon = it.icon;
            const active = it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
            return (
              <DropdownMenuItem key={it.href} asChild>
                <Link
                  href={it.href}
                  className={cn("flex items-center gap-2 cursor-pointer", active && "bg-accent")}
                >
                  <Icon className="h-4 w-4" />
                  {it.label}
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </nav>
  );
}
