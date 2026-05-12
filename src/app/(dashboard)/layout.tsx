import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { getBrandSettings } from "@/lib/branding";
import { getT } from "@/lib/i18n/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const brand = await getBrandSettings();
  const { t, locale } = await getT();
  return (
    <AppShell
      defaultPersona={user.personaPreference}
      user={{ name: user.name, email: user.email, role: user.role }}
      brand={{ productName: brand.productName, tenantName: brand.tenantName, style: brand.style }}
      locale={locale}
      navLabels={t.nav}
    >
      {children}
    </AppShell>
  );
}
