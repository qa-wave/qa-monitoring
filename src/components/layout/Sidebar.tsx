"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  ClipboardList,
  Globe,
  LayoutDashboard,
  Palette,
  Rocket,
  Server,
  Settings,
  ShieldCheck,
  TestTube2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import type { Translations } from "@/lib/i18n";
import { Changelog } from "./Changelog";

type BrandHeader = { productName: string; tenantName: string };

type NavItem = {
  href: string;
  labelKey: keyof Translations["nav"];
  icon: React.ElementType;
  adminOnly?: boolean;
  exact?: boolean;
};

const items: NavItem[] = [
  { href: "/", labelKey: "overview", icon: LayoutDashboard, exact: true },
  { href: "/environments", labelKey: "environments", icon: Globe },
  { href: "/applications", labelKey: "applications", icon: Boxes },
  { href: "/releases", labelKey: "releases", icon: Rocket },
  { href: "/tests", labelKey: "tests", icon: TestTube2 },
  { href: "/incidents", labelKey: "incidents", icon: AlertTriangle },
  { href: "/quality", labelKey: "quality", icon: ShieldCheck },
  { href: "/product", labelKey: "product", icon: BarChart3 },
  { href: "/status/preview", labelKey: "publicStatus", icon: Activity },
  { href: "/admin/integrations", labelKey: "integrations", icon: Settings, adminOnly: true },
  { href: "/admin/branding", labelKey: "branding", icon: Palette, adminOnly: true },
  { href: "/admin/users", labelKey: "users", icon: Users, adminOnly: true },
  { href: "/admin/environments", labelKey: "envAdmin", icon: Server, adminOnly: true },
  { href: "/admin/apps", labelKey: "appsAdmin", icon: Boxes, adminOnly: true },
  { href: "/admin/audit", labelKey: "audit", icon: ClipboardList, adminOnly: true },
];

export function Sidebar({ role, brand, navLabels }: { role: UserRole; brand: BrandHeader; navLabels: Translations["nav"] }) {
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
                    <span className="truncate">{navLabels[it.labelKey]}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
      <div className="border-t border-border p-4 text-xs text-muted-foreground space-y-2">
        <Changelog />
        <div>{brand.productName} · pro {brand.tenantName}</div>
      </div>
    </aside>
  );
}
