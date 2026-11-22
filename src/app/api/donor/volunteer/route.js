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
    const existing = await prisma.volunteer.findFirst({
      where: {
        email: { equals: targetEmail, mode: "insensitive" },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data pendaftaran relawan tidak ditemukan atau sudah dibatalkan." },
        { status: 404 }
      );
    }

    if (existing.status === "APPROVED" || existing.status === "ACCEPTED") {
      return NextResponse.json(
        {
          success: false,
          message: "Status keanggotaan relawan Anda telah aktif. Pembatalan atau penonaktifan keanggotaan resmi harus melalui konfirmasi pengurus yayasan.",
        },
        { status: 403 }
      );
    }

    await prisma.volunteer.delete({
      where: { id: existing.id },
    });

    try {
      const { broadcastAdminEvent } = await import("@/lib/sseBroadcast");
      broadcastAdminEvent("VOLUNTEER_CANCELLED", {
        id: existing.id,
        fullName: existing.fullName,
        email: existing.email || targetEmail,
        city: existing.city || "",
      });
    } catch (sseErr) {
      console.warn("Peringatan: Gagal broadcast SSE volunteer cancellation:", sseErr?.message);
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
