"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ChevronRight, Palette, Plug, Users, Server, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  completed: boolean;
}

interface OnboardingChecklistProps {
  brandCustomized: boolean;
  integrationCount: number;
  userCount: number;
  envCount: number;
}

const STORAGE_KEY = "zornik-onboarding-dismissed";

function subscribeToDismissed(onStoreChange: () => void) {
  // Listen for storage events from other tabs
  const handler = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}

function getDismissedSnapshot(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

function getDismissedServerSnapshot(): boolean {
  return true; // SSR: default to dismissed to avoid flash
}

export function OnboardingChecklist({
  brandCustomized,
  integrationCount,
  userCount,
  envCount,
}: OnboardingChecklistProps) {
  const dismissed = React.useSyncExternalStore(
    subscribeToDismissed,
    getDismissedSnapshot,
    getDismissedServerSnapshot,
  );

  const [, forceRender] = React.useReducer((x: number) => x + 1, 0);

  const steps: OnboardingStep[] = [
    {
      title: "Nastav brand barvy",
      description: "Přizpůsob logo, barvy a vizuální styl.",
      href: "/admin/branding",
      icon: Palette,
      completed: brandCustomized,
    },
    {
      title: "Připoj první integraci",
      description: "Napoj GitHub, Sentry nebo jiný nástroj.",
      href: "/admin/integrations",
      icon: Plug,
      completed: integrationCount > 0,
    },
    {
      title: "Přidej členy týmu",
      description: "Pozvi kolegy a nastav jim role.",
      href: "/admin/users",
      icon: Users,
      completed: userCount > 2,
    },
    {
      title: "Přizpůsob prostředí",
      description: "Uprav dev, test, stage a prod.",
      href: "/admin/environments",
      icon: Server,
      completed: envCount > 4,
    },
  ];

  if (dismissed) return null;

  const completedCount = steps.filter((s) => s.completed).length;
  const allDone = completedCount === steps.length;

  function handleDismiss() {
    localStorage.setItem(STORAGE_KEY, "true");
    forceRender();
  }

  return (
    <Card className="relative overflow-hidden border-[hsl(var(--brand-primary)/0.3)]">
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
        style={{ width: `${(completedCount / steps.length) * 100}%` }}
      />
      <CardHeader className="flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-base">
            {allDone ? "Vše nastaveno!" : "Začni zde"}
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            {completedCount}/{steps.length} kroků hotovo
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground"
          onClick={handleDismiss}
          title="Skrýt průvodce"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-1 pt-0">
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <Link
              key={i}
              href={step.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                step.completed
                  ? "text-muted-foreground"
                  : "hover:bg-accent/60"
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium",
                  step.completed
                    ? "border-[hsl(var(--status-ok))] bg-[hsl(var(--status-ok))]/10 text-[hsl(var(--status-ok))]"
                    : "border-border text-muted-foreground"
                )}
              >
                {step.completed ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className={cn("font-medium", step.completed && "line-through decoration-muted-foreground/40")}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
              {!step.completed && <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}
