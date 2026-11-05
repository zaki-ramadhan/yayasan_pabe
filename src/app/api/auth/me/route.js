import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/serverAuth";
import { getInitials } from "@/lib/formatters";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { authenticated, user, reason } = await getAuthenticatedUser(request);

    if (!authenticated || !user) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          reason: reason || "UNKNOWN",
          message:
            reason === "ACCOUNT_SUSPENDED"
              ? "Akun Anda dinonaktifkan. Silakan hubungi admin yayasan."
              : "Sesi tidak ditemukan atau telah berakhir.",
        },
        { status: 401 }
      );
    }

    const title =
      user.title && user.title.includes("Ketua Yayasan") ? "Super Admin" : user.title;

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        ...user,
        title,
        initials: user.initials || getInitials(user.name, user.email),
      },
    });

    // Sinkronkan cookie role agar konsisten dengan autoritas server
    response.cookies.set("pabe_role", user.role, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("Fetch current user session error:", err);
    return NextResponse.json(
      { success: false, message: "Gagal memverifikasi sesi." },
      { status: 500 }
    );
  }
}
