import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { getStorageOverview } from "@/services/adminStorageService";

export const dynamic = "force-dynamic";

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
      data: overview,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat status penyimpanan R2." },
      { status: 500 }
    );
  }
}
