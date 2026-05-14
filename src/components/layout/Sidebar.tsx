"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BellRing,
  Boxes,
  ClipboardList,
  Globe,
  LayoutDashboard,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Rocket,
  Server,
  Settings,
  Shield,
  ShieldCheck,
  TestTube2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/lib/types";
import type { Translations } from "@/lib/i18n";
import { Changelog } from "./Changelog";
import { useSidebar } from "./SidebarContext";

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
  { href: "/admin/alerts", labelKey: "alerts", icon: BellRing, adminOnly: true },
  { href: "/admin/roles", labelKey: "roles", icon: Shield, adminOnly: true },
  { href: "/admin/audit", labelKey: "audit", icon: ClipboardList, adminOnly: true },
];

export function Sidebar({ role, brand, navLabels }: { role: UserRole; brand: BrandHeader; navLabels: Translations["nav"] }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebar();

  return (
    <aside
      className={cn(
        "hidden lg:flex lg:flex-col lg:border-r lg:border-border lg:bg-card/40 transition-[width] duration-200 ease-in-out",
        collapsed ? "lg:w-16" : "lg:w-60"
      )}
    >
      {/* Brand header */}
      <div className={cn("flex h-16 items-center border-b border-border", collapsed ? "justify-center px-2" : "px-6")}>
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight">
          <span
            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full bg-[hsl(var(--brand-primary))] shadow-[0_0_8px_hsl(var(--brand-primary)/0.6)]"
            aria-hidden
          />
          {!collapsed && <span>{brand.productName}</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        <ul className="space-y-1">
          {items
            .filter((it) => !it.adminOnly || role === "admin")
            .map((it) => {
              const active = it.exact ? pathname === it.href : pathname.startsWith(it.href);
              const Icon = it.icon;
              const label = navLabels[it.labelKey] ?? it.labelKey;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    title={collapsed ? label : undefined}
                    className={cn(
                      "group flex items-center rounded-md text-sm font-medium transition-colors",
                      collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                      active
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>

      {/* Toggle button */}
      <div className={cn("border-t border-border", collapsed ? "px-2 py-2" : "px-3 py-2")}>
        <button
          type="button"
          onClick={toggle}
          title={collapsed ? "Rozbalit sidebar" : "Sbalit sidebar"}
          className={cn(
            "flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
          {!collapsed && <span>Sbalit</span>}
        </button>
      </div>

      {/* Brand footer */}
      <div className={cn("border-t border-border text-xs text-muted-foreground space-y-2", collapsed ? "px-2 py-3" : "p-4")}>
        {!collapsed && <Changelog />}
        <div className={collapsed ? "flex justify-center" : ""}>
          {collapsed ? (
            <span
              className="inline-block h-2 w-2 rounded-full bg-[hsl(var(--brand-primary))]"
              title={`${brand.productName} · pro ${brand.tenantName}`}
            />
          ) : (
            <span>{brand.productName} · pro {brand.tenantName}</span>
          )}
        </div>
      </div>
    </aside>
  );
}
