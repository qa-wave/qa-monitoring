"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Cable, Palette, Sparkles, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const STORAGE_KEY = "zornik-onboarding-done";

interface Step {
  title: string;
  description: string;
  icon: React.ReactNode;
  link?: { href: string; label: string };
}

const steps: Step[] = [
  {
    title: "Vítejte v Zorníku",
    description:
      "Zorník sjednocuje signály z verzování, CI/CD, testů, releasů, observability a feedbacku do jednoho dashboardu. Projdeme spolu základní nastavení.",
    icon: <Sparkles className="h-8 w-8 text-[hsl(var(--brand-primary))]" />,
  },
  {
    title: "Napojte integrace",
    description:
      "Připojte GitHub, Sentry, Vercel, PagerDuty a další nástroje, které váš tým používá. Data se začnou stahovat okamžitě.",
    icon: <Cable className="h-8 w-8 text-[hsl(var(--brand-primary))]" />,
    link: { href: "/admin/integrations", label: "Nastavit integrace" },
  },
  {
    title: "Přizpůsobte vzhled",
    description:
      "Zvolte barvy a vizuální styl, který odpovídá vašemu brandu. K dispozici je 5 presetových stylů.",
    icon: <Palette className="h-8 w-8 text-[hsl(var(--brand-primary))]" />,
    link: { href: "/admin/branding", label: "Nastavit branding" },
  },
  {
    title: "Pozvěte tým",
    description:
      "Přidejte kolegy jako viewery nebo adminy. Každý si může zvolit svou personu (vývojář, PM, tester).",
    icon: <Users className="h-8 w-8 text-[hsl(var(--brand-primary))]" />,
    link: { href: "/admin/users", label: "Spravovat uživatele" },
  },
];

function subscribe(_cb: () => void) {
  return () => {};
}

function getSnapshot(): boolean {
  try {
    return !localStorage.getItem(STORAGE_KEY);
  } catch {
    return false;
  }
}

function getServerSnapshot(): boolean {
  return false;
}

function markDone() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // noop
  }
}

export function OnboardingWizard() {
  const shouldShow = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const [step, setStep] = useState(0);

  const open = shouldShow && !dismissed;

  function handleClose() {
    setDismissed(true);
    markDone();
  }

  function handleNext() {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  const current = steps[step];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {current.icon}
            {current.title}
          </DialogTitle>
          <DialogDescription className="pt-2">{current.description}</DialogDescription>
        </DialogHeader>

        {current.link && (
          <div className="flex justify-center">
            <Link
              href={current.link.href}
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-md border border-[hsl(var(--brand-primary)/0.3)] px-4 py-2 text-sm font-medium text-[hsl(var(--brand-primary))] hover:bg-[hsl(var(--brand-primary)/0.08)]"
            >
              {current.link.label}
            </Link>
          </div>
        )}

        {/* Step dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {steps.map((_, i) => (
            <span
              key={i}
              className={
                "h-2 w-2 rounded-full transition-colors " +
                (i === step
                  ? "bg-[hsl(var(--brand-primary))]"
                  : i < step
                  ? "bg-[hsl(var(--brand-primary)/0.4)]"
                  : "bg-muted-foreground/30")
              }
            />
          ))}
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <button
            type="button"
            onClick={handleClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Přeskočit
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                Zpět
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="rounded-md bg-[hsl(var(--brand-primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              {step < steps.length - 1 ? "Další" : "Hotovo"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
