import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { getAdminDonorDetail } from "@/services/adminDonorService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
    USER_ROLES.VOLUNTEER,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || "";
    const phone = searchParams.get("phone") || "";
    const name = searchParams.get("name") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "8", 10);

    const detail = await getAdminDonorDetail({ email, phone, name, page, limit });
    return NextResponse.json({
      success: true,
      data: detail,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil riwayat donatur." },
      { status: 500 }
    );
  }
}
