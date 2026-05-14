import Link from "next/link";
import { Bell, Globe, Palette, Plug, ScrollText, Server, ShieldCheck, Users } from "lucide-react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { requirePermission } from "@/lib/auth";

const adminSections = [
  { title: "Branding", description: "Barvy, vizuální styl a identita.", href: "/admin/branding", icon: Palette },
  { title: "Integrace", description: "Napojené nástroje a SDLC pokrytí.", href: "/admin/integrations", icon: Plug },
  { title: "Uživatelé", description: "Správa účtů, rolí a hesel.", href: "/admin/users", icon: Users },
  { title: "Prostředí", description: "Dev, test, stage, prod.", href: "/admin/environments", icon: Globe },
  { title: "Aplikace", description: "Katalog monitorovaných aplikací.", href: "/admin/apps", icon: Server },
  { title: "Alerty", description: "Pravidla upozornění a notifikací.", href: "/admin/alerts", icon: Bell },
  { title: "Role", description: "Matice oprávnění a systémové role.", href: "/admin/roles", icon: ShieldCheck },
  { title: "Audit log", description: "Historie akcí administrátorů.", href: "/admin/audit", icon: ScrollText },
];

export default async function AdminHubPage() {
  await requirePermission("users:view");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nastavení"
        description="Centrální správa celé platformy."
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="group flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-[hsl(var(--brand-primary)/0.4)] hover:bg-accent/40"
            >
              <div className="rounded-lg border border-border bg-muted/40 p-2.5 transition-colors group-hover:border-[hsl(var(--brand-primary)/0.3)] group-hover:bg-[hsl(var(--brand-primary)/0.08)]">
                <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-[hsl(var(--brand-primary))]" />
              </div>
              <div>
                <div className="font-medium">{section.title}</div>
                <div className="text-sm text-muted-foreground">{section.description}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
