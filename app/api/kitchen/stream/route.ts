import { NextRequest } from "next/server";
import { subscribeToOrders, getServerOrders } from "@/lib/serverStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial queue snapshot
      const initialOrders = getServerOrders();
      controller.enqueue(
        encoder.encode(`event: initial\ndata: ${JSON.stringify(initialOrders)}\n\n`)
      );

      // Subscribe to live new orders or updates
      const unsubscribe = subscribeToOrders((updatedOrder) => {
        try {
          controller.enqueue(
            encoder.encode(`event: update\ndata: ${JSON.stringify(updatedOrder)}\n\n`)
          );
        } catch (err) {
          console.error("SSE stream enqueue error:", err);
        }
      });

      // Keepalive ping every 15 seconds
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: ping\n\n`));
        } catch {
          clearInterval(pingInterval);
          unsubscribe();
        }
      }, 15000);

      req.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
