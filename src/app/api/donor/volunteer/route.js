import { NextResponse } from "next/server";
import { getVolunteerByEmail } from "@/services/volunteerVerificationService";
import { checkRateLimit } from "@/lib/rateLimit";
import { requireAuth } from "@/lib/serverAuth";

export async function GET(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "donor_volunteer_query",
      limit: 30,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("email")?.trim().toLowerCase();
    const isStaff = Boolean(user.role && user.role !== "DONOR");

    if (requestedEmail && !isStaff && requestedEmail !== user.email.trim().toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki izin untuk melihat data relawan pengguna lain." },
        { status: 403 }
      );
    }

    const targetEmail = (isStaff && requestedEmail) ? requestedEmail : user.email;
    const volunteer = await getVolunteerByEmail(targetEmail);

    return NextResponse.json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    console.error("Error GET /api/donor/volunteer:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat informasi relawan." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "donor_volunteer_cancel",
      limit: 10,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const targetEmail = (user?.email || "").trim().toLowerCase();
    if (!targetEmail) {
      return NextResponse.json(
        { success: false, message: "Sesi otentikasi tidak memiliki email yang valid." },
        { status: 401 }
      );
    }

    const { prisma } = await import("@/lib/prisma");
    const result = await prisma.volunteer.deleteMany({
      where: {
        email: { equals: targetEmail, mode: "insensitive" },
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { success: false, message: "Data pendaftaran relawan tidak ditemukan atau sudah dibatalkan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pendaftaran relawan berhasil dibatalkan.",
    });
  } catch (error) {
    console.error("Error DELETE /api/donor/volunteer:", error);
    return NextResponse.json(
      { success: false, message: "Gagal membatalkan pendaftaran relawan." },
      { status: 500 }
    );
  }
}
