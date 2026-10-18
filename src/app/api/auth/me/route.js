import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const sessionId = request.cookies.get("pabe_session")?.value || request.cookies.get("ygsm_session")?.value;

  if (!sessionId) {
    return NextResponse.json(
      { success: false, authenticated: false, message: "Tidak ada sesi aktif." },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: sessionId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        title: true,
        avatar: true,
        phone: true,
        provider: true,
        createdAt: true,
      },
    });

    if (!user) {
      const response = NextResponse.json(
        { success: false, authenticated: false, message: "Pengguna tidak ditemukan." },
        { status: 401 }
      );
      response.cookies.delete("pabe_session");
      response.cookies.delete("ygsm_session");
      return response;
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        ...user,
        initials: (user.name || user.email).slice(0, 2).toUpperCase(),
      },
    });
  } catch (err) {
    console.error("Fetch current user session error:", err);
    return NextResponse.json(
      { success: false, message: "Gagal memverifikasi sesi." },
      { status: 500 }
    );
  }
}
