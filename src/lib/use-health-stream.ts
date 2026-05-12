"use client";
import { useState, useEffect } from "react";

interface HealthSummary {
  ok: number;
  warn: number;
  down: number;
  total: number;
  at: string;
}

export function useHealthStream() {
  const [health, setHealth] = useState<HealthSummary | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/stream/health");
    es.addEventListener("health", (e) => {
      try {
        setHealth(JSON.parse(e.data));
      } catch {
        // ignore malformed events
      }
    });
    return () => es.close();
  }, []);

  return health;
}
