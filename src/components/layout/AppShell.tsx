import { Sidebar } from "./Sidebar";
import { SidebarProvider } from "./SidebarContext";
import { Header } from "./Header";
import { MobileBottomNav } from "./MobileBottomNav";
import { CommandPalette } from "./CommandPalette";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { OnboardingWizard } from "./OnboardingWizard";
import { PageTransition } from "./PageTransition";
import { ToastProvider } from "@/components/ui/toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import type { PersonaKey, UserRole } from "@/lib/types";
import type { StyleKey } from "@/lib/branding/types";
import type { Locale, Translations } from "@/lib/i18n";

export function AppShell({
  children,
  defaultPersona,
  user,
  brand,
  locale,
  navLabels,
}: {
  children: React.ReactNode;
  defaultPersona: PersonaKey;
  user: { name: string; email: string; role: UserRole };
  brand: { productName: string; tenantName: string; style: StyleKey };
  locale: Locale;
  navLabels: Translations["nav"];
}) {
  return (
    <SidebarProvider>
    <ToastProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar role={user.role} brand={brand} navLabels={navLabels} />
        <div className="flex flex-1 flex-col min-w-0">
          <Header defaultPersona={defaultPersona} user={user} currentStyle={brand.style} locale={locale} />
          <main className="flex-1 overflow-y-auto px-4 pb-20 pt-6 lg:px-8 lg:pb-8">
            <ErrorBoundary>
              <PageTransition>{children}</PageTransition>
            </ErrorBoundary>
          </main>
          <MobileBottomNav role={user.role} navLabels={navLabels} />
        </div>
        <CommandPalette role={user.role} />
        <KeyboardShortcuts />
        {user.role === "admin" && <OnboardingWizard />}
      </div>
    </ToastProvider>
    </SidebarProvider>
  );
}
