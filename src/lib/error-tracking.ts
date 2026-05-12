import { logger } from "./logger";

export function captureException(error: unknown, context?: Record<string, unknown>): void {
  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  logger.error("exception.captured", { message, stack, ...context });
  // TODO: Wire to Sentry SDK when SENTRY_DSN is configured
  // if (process.env.SENTRY_DSN) { Sentry.captureException(error, { extra: context }); }
}

export function captureMessage(message: string, level: "info" | "warning" = "info", context?: Record<string, unknown>): void {
  logger.info("message.captured", { message, level, ...context });
}
