import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { requireAuth } from "@/lib/serverAuth";
import { cancelUserJobApplication } from "@/services/careerService";

/**
 * DELETE /api/user/career-applications/[id]
 * Membatalkan lamaran pekerjaan milik pengguna aktif (hanya jika PENDING).
 */
export async function DELETE(request, { params }) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "user_career_cancel",
      limit: 10,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const resolvedParams = await params;
    const applicationId = resolvedParams?.id;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: "ID lamaran pekerjaan wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await cancelUserJobApplication(applicationId, user.email);

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal membatalkan berkas lamaran.",
      },
      { status: 400 }
    );
  }
}

