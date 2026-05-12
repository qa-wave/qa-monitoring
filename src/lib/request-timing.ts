import { logger } from "./logger";

export function withTiming<T>(name: string, fn: () => Promise<T>): Promise<T> {
  const start = Date.now();
  return fn().finally(() => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn("slow_request", { name, durationMs: duration });
    } else {
      logger.debug("request_timing", { name, durationMs: duration });
    }
  });
}
