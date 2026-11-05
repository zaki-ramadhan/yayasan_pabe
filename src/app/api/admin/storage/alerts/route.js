import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { getStorageOverview } from "@/services/adminStorageService";

export const dynamic = "force-dynamic";

/**
 * Endpoint ringkas untuk status peringatan kesehatan penyimpanan Cloudflare R2.
 * Hanya mengembalikan ringkasan metrik kesehatan tanpa metadata ribuan berkas.
 */
export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const overview = await getStorageOverview();
    return NextResponse.json({
      success: true,
      data: {
        isConfigured: overview.isConfigured,
        totalBytes: overview.totalBytes,
        limitBytes: overview.limitBytes,
        totalCount: overview.totalCount,
        usagePercent: overview.usagePercent,
        health: overview.health,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memuat status peringatan penyimpanan.",
      },
      { status: 500 }
    );
  }
}
