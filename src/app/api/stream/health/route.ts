import { NextResponse } from "next/server";
import { healthChecks } from "@/data/health-checks";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      function sendHealth() {
        const ok = healthChecks.filter((h) => h.status === "ok").length;
        const warn = healthChecks.filter((h) => h.status === "warn").length;
        const down = healthChecks.filter((h) => h.status === "down").length;
        const data = JSON.stringify({
          ok,
          warn,
          down,
          total: healthChecks.length,
          at: new Date().toISOString(),
        });
        controller.enqueue(encoder.encode(`event: health\ndata: ${data}\n\n`));
      }

      sendHealth();
      const interval = setInterval(sendHealth, 30_000);

      // Clean up when the client disconnects.
      // The stream naturally closes on disconnect; this guards the timer.
      void new Promise<void>((resolve) => {
        const check = setInterval(() => {
          try {
            controller.enqueue(encoder.encode(":\n\n")); // heartbeat comment
          } catch {
            clearInterval(interval);
            clearInterval(check);
            resolve();
          }
        }, 30_000);
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
