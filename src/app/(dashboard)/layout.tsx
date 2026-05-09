import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";
import { getBrandSettings } from "@/lib/branding";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const brand = await getBrandSettings();
  return (
    <AppShell
      defaultPersona={user.personaPreference}
      user={{ name: user.name, email: user.email, role: user.role }}
      brand={{ productName: brand.productName, tenantName: brand.tenantName }}
    >
      {children}
    </AppShell>
  );
}
