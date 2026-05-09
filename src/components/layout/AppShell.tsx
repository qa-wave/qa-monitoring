import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import type { PersonaKey, UserRole } from "@/lib/types";

export function AppShell({
  children,
  defaultPersona,
  user,
  brand,
}: {
  children: React.ReactNode;
  defaultPersona: PersonaKey;
  user: { name: string; email: string; role: UserRole };
  brand: { productName: string; tenantName: string };
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar role={user.role} brand={brand} />
      <div className="flex flex-1 flex-col">
        <Header defaultPersona={defaultPersona} user={user} />
        <main className="flex-1 overflow-y-auto px-4 pb-20 pt-6 lg:px-8 lg:pb-8">{children}</main>
        <MobileBottomNav role={user.role} />
      </div>
    </div>
  );
}
