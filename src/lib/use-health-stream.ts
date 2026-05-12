"use client";
import { useState, useEffect, useRef } from "react";

interface HealthSummary {
  ok: number;
  warn: number;
  down: number;
  total: number;
  at: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000;

export function useHealthStream() {
  const [health, setHealth] = useState<HealthSummary | null>(null);
  const retriesRef = useRef(0);

  useEffect(() => {
    let es: EventSource | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let disposed = false;

    function connect() {
      if (disposed) return;
      es = new EventSource("/api/stream/health");

      es.addEventListener("health", (e) => {
        try {
          setHealth(JSON.parse(e.data));
          // Reset retry counter on successful message
          retriesRef.current = 0;
        } catch {
          // ignore malformed events
        }
      });

      es.onerror = () => {
        es?.close();
        es = null;
        if (disposed) return;

        if (retriesRef.current < MAX_RETRIES) {
          retriesRef.current += 1;
          timer = setTimeout(connect, RETRY_DELAY_MS);
        }
      };
    }

    connect();

    return () => {
      disposed = true;
      es?.close();
      if (timer) clearTimeout(timer);
    };
  }, []);

  return health;
}
