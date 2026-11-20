import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { requireAuth } from "@/lib/serverAuth";
import { getUserApplications } from "@/services/careerApplicationService";

/**
 * GET /api/user/career-applications
 * Mengambil seluruh riwayat lamaran pekerjaan milik pengguna terautentikasi.
 * Dilindungi autentikasi sesi server untuk mencegah IDOR.
 */
export async function GET(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "user_career_applications",
      limit: 30,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("email")?.trim().toLowerCase();
    const isStaff = Boolean(user.role && user.role !== "DONOR");

    if (requestedEmail && !isStaff && requestedEmail !== user.email?.trim().toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki izin untuk melihat data lamaran pengguna lain." },
        { status: 403 }
      );
    }

    const userEmail = (isStaff && requestedEmail) ? requestedEmail : (user?.email?.trim().toLowerCase() || requestedEmail);
    if (!userEmail) {
      return NextResponse.json(
        { success: false, message: "Sesi pengguna tidak memiliki alamat email yang valid." },
        { status: 400 }
      );
    }

    const applications = await getUserApplications(userEmail);

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Error GET /api/user/career-applications:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memuat data riwayat lamaran pekerjaan.",
      },
      { status: 500 }
    );
  }
}

