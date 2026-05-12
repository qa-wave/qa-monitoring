"use client";
import * as React from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number; // ms, default 800
  decimals?: number;
  className?: string;
}

export function AnimatedNumber({ value, duration = 800, decimals = 0, className }: AnimatedNumberProps) {
  const [display, setDisplay] = React.useState(0);
  const startTime = React.useRef<number | null>(null);
  const rafId = React.useRef<number>(0);

  React.useEffect(() => {
    startTime.current = null;
    function animate(timestamp: number) {
      if (startTime.current === null) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(eased * value);
      if (progress < 1) {
        rafId.current = requestAnimationFrame(animate);
      }
    }
    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [value, duration]);

  const formatted = decimals > 0
    ? display.toFixed(decimals).replace(".", ",")
    : Math.round(display).toLocaleString("cs-CZ");

  return <span className={className}>{formatted}</span>;
}
