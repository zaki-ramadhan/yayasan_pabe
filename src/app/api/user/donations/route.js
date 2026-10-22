import { NextResponse } from "next/server";
import {
  getDonorHistory,
  getDonorDashboardOverview,
  getDonorMonthlyTrend,
} from "@/services/donorService";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";

export async function GET(request) {
  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("email");
    const requestedName = searchParams.get("name");
    const mode = searchParams.get("mode") || "";
    const year = searchParams.get("year") || "";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Strict Scope: Regular users can only access their own donations (Anti-IDOR)
    const isAdmin = authUser.role && authUser.role !== USER_ROLES.DONOR;
    const userEmail = (isAdmin && requestedEmail) ? requestedEmail : authUser.email;
    const userName = (isAdmin && requestedName) ? requestedName : authUser.name;

    if (mode === "trend") {
      const data = await getDonorMonthlyTrend({
        userEmail,
        userName,
        year,
      });

      return NextResponse.json({
        success: true,
        data,
      });
    }

    if (mode === "dashboard") {
      const data = await getDonorDashboardOverview({
        userEmail,
        userName,
        year,
      });

      return NextResponse.json({
        success: true,
        data,
      });
    }

    const data = await getDonorHistory({
      userEmail,
      userName,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("API GET /api/user/donations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memuat riwayat donasi.",
      },
      { status: 500 }
    );
  }
}
