import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { registerAdminSSEClient, unregisterAdminSSEClient } from "@/lib/sseBroadcast";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
    USER_ROLES.VOLUNTEER,
  ]);

  if (errorResponse) {
    return errorResponse;
  }

  let heartbeatInterval = null;
  let activeController = null;

  const stream = new ReadableStream({
    start(controller) {
      activeController = controller;
      registerAdminSSEClient(controller);

      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ status: "connected" })}\n\n`)
      );

      // Heartbeat comment ping setiap 25 detik agar koneksi tidak diputus oleh proxy/Cloudflare
      heartbeatInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": ping\n\n"));
        } catch {
          if (heartbeatInterval) clearInterval(heartbeatInterval);
          unregisterAdminSSEClient(controller);
        }
      }, 25000);
    },
    cancel() {
      if (heartbeatInterval) clearInterval(heartbeatInterval);
      if (activeController) unregisterAdminSSEClient(activeController);
    },
  });

  request.signal.addEventListener("abort", () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (activeController) unregisterAdminSSEClient(activeController);
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
