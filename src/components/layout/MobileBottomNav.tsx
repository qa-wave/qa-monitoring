"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AlertTriangle, LayoutDashboard, Rocket, Settings, TestTube2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

type Item = { href: string; label: string; icon: React.ElementType; adminOnly?: boolean };

const items: Item[] = [
  { href: "/", label: "Přehled", icon: LayoutDashboard },
  { href: "/releases", label: "Releasy", icon: Rocket },
  { href: "/tests", label: "Testy", icon: TestTube2 },
  { href: "/incidents", label: "Incidenty", icon: AlertTriangle },
  { href: "/admin/integrations", label: "Admin", icon: Settings, adminOnly: true },
];

export function MobileBottomNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const visible = items.filter((i) => !i.adminOnly || role === "admin");
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-border bg-background/95 backdrop-blur lg:hidden">
      {visible.map((it) => {
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
    </nav>
  );
}
