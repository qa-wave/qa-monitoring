"use client";
import * as React from "react";
import { usePathname } from "next/navigation";

/**
 * Fade-in animation on route change. Uses a key-based remount so the
 * CSS animation replays each time the pathname changes, avoiding
 * synchronous setState inside useEffect.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-fade-in"
      style={{
        animationDuration: "300ms",
        animationTimingFunction: "ease-out",
        animationFillMode: "both",
      }}
    >
      {children}
    </div>
  );
}
