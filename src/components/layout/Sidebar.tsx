"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  Globe,
  LayoutDashboard,
  Palette,
  Rocket,
  Settings,
  ShieldCheck,
  TestTube2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";

type BrandHeader = { productName: string; tenantName: string };

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  exact?: boolean;
};

const items: NavItem[] = [
  { href: "/", label: "Přehled", icon: LayoutDashboard, exact: true },
  { href: "/environments", label: "Prostředí", icon: Globe },
  { href: "/applications", label: "Aplikace", icon: Boxes },
  { href: "/releases", label: "Releasy", icon: Rocket },
  { href: "/tests", label: "Testy", icon: TestTube2 },
  { href: "/incidents", label: "Incidenty", icon: AlertTriangle },
  { href: "/quality", label: "Kvalita & bezpečnost", icon: ShieldCheck },
  { href: "/product", label: "Produkt", icon: BarChart3 },
  { href: "/status/preview", label: "Veřejný status", icon: Activity },
  { href: "/admin/integrations", label: "Integrace", icon: Settings, adminOnly: true },
  { href: "/admin/branding", label: "Vzhled", icon: Palette, adminOnly: true },
];

export function Sidebar({ role, brand }: { role: UserRole; brand: BrandHeader }) {
  const pathname = usePathname();
  return (
    <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-border lg:bg-card/40">
      <div className="flex h-16 items-center border-b border-border px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full bg-[hsl(var(--brand-primary))] shadow-[0_0_8px_hsl(var(--brand-primary)/0.6)]"
            aria-hidden
          />
          <span>{brand.productName}</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {items
            .filter((it) => !it.adminOnly || role === "admin")
            .map((it) => {
              const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{it.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
      <div className="border-t border-border p-4 text-xs text-muted-foreground">
        {brand.productName} · pro {brand.tenantName}
      </div>
    </aside>
  );
}
