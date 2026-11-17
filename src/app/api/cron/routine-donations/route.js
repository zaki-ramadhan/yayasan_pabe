import { NextResponse } from "next/server";
import { processScheduledRoutineDonations } from "@/services/routineDonationSchedulerService";

/**
 * Validates request authorization for cron execution.
 * Accepts Vercel Cron header or Bearer CRON_SECRET token.
 */
function isAuthorized(request) {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (cronSecret) {
    return authHeader === `Bearer ${cronSecret}`;
  }

  const vercelCronHeader = request.headers.get("x-vercel-cron");
  if (process.env.VERCEL === "1" && vercelCronHeader) {
    return true;
  }

  return false;
}

/**
 * GET Handler - Dipanggil otomatis oleh Vercel Cron Jobs secara berkala.
 */
export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan (Unauthorized Cron Execution)." },
      { status: 401 }
    );
  }

  try {
    const result = await processScheduledRoutineDonations();
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[CRON Routine Donations Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengeksekusi cron jadwal donasi rutin.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST Handler - Dipanggil untuk testing manual atau webhook eksternal.
 * Mendukung opsi { forceRoutineId: string } untuk menguji komitmen donatur tertentu secara instan.
 */
export async function POST(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan (Unauthorized Cron Execution)." },
      { status: 401 }
    );
  }

  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
    }

    const { forceRoutineId } = body;
    const result = await processScheduledRoutineDonations({
      forceRoutineId: forceRoutineId || null,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[Manual Trigger Routine Donations Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengeksekusi cron jadwal donasi rutin.",
      },
      { status: 500 }
    );
  }
}
