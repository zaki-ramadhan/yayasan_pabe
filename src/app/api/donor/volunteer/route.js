import { NextResponse } from "next/server";
import { getVolunteerByEmail } from "@/services/volunteerVerificationService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "donor_volunteer_query",
      limit: 30,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email pengguna wajib disertakan." },
        { status: 400 }
      );
    }

    const volunteer = await getVolunteerByEmail(email);

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

    const { prisma } = await import("@/lib/prisma");
    const sessionId = request.cookies.get("pabe_session")?.value;
    let targetEmail = "";

    if (sessionId) {
      const user = await prisma.user.findUnique({
        where: { id: sessionId },
        select: { email: true },
      });
      if (user?.email) {
        targetEmail = user.email.trim().toLowerCase();
      }
    }

    // Fallback baca email dari JSON body jika sesi cookie tidak terpasang
    if (!targetEmail) {
      const body = await request.json().catch(() => ({}));
      if (body?.email) {
        targetEmail = String(body.email).trim().toLowerCase();
      }
    }

    if (!targetEmail) {
      return NextResponse.json(
        { success: false, message: "Sesi otentikasi atau email wajib disertakan." },
        { status: 401 }
      );
    }

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
