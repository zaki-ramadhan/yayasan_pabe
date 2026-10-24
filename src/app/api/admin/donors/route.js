import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { getAdminDonors } from "@/services/adminDonorService";

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
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getAdminDonors({ search, page, limit });
    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      totalCount: result.totalCount,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data donatur." },
      { status: 500 }
    );
  }
}
