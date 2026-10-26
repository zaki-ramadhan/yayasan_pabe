import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // Cegah spam scraping pada endpoint status
  const rateLimitBlocked = checkRateLimit(request, {
    action: "health_check",
    limit: 60,
    windowMs: 60000,
  });
  if (rateLimitBlocked) return rateLimitBlocked;

  const startTime = Date.now();

  try {
    // Query ultra-ringan tanpa scanning tabel (< 1ms)
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected",
        latencyMs,
        uptimeSeconds: Math.floor(process.uptime()),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "degraded",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        message: "Koneksi database sedang mengalami kendala.",
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  }
}
