import { NextResponse } from "next/server";
import { expireStalePendingDonations } from "@/services/donationExpiryService";

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

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  const vercelCronHeader = request.headers.get("x-vercel-cron");
  if (process.env.VERCEL === "1" && vercelCronHeader) {
    return true;
  }

  return false;
}

/**
 * GET Handler - Dipanggil otomatis oleh Vercel Cron Jobs secara berkala (misal setiap 15 menit).
 */
export async function GET(request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { success: false, message: "Akses tidak diizinkan (Unauthorized Cron Execution)." },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit"), 10) || 50;

    const result = await expireStalePendingDonations(limit);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[CRON Expire Donations Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengeksekusi cron kedaluwarsa donasi.",
      },
      { status: 500 }
    );
  }
}

/**
 * POST Handler - Dipanggil untuk testing manual atau webhook trigger.
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
      // Body kosong diperbolehkan
    }

    const limit = parseInt(body.limit, 10) || 50;
    const result = await expireStalePendingDonations(limit);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[Manual Trigger Expire Donations Error]", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengeksekusi cron kedaluwarsa donasi.",
      },
      { status: 500 }
    );
  }
}
