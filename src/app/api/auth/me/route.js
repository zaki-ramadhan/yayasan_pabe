import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isSuperAdminEmail, isSuperAdminIdentifier } from "@/lib/serverAuth";
import { DEMO_USERS, USER_ROLES } from "@/services/authService";

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
    let user = await prisma.user.findUnique({
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

    // Check demo users fallback if not in DB
    if (!user) {
      const demoMatch = DEMO_USERS.find(
        (u) =>
          u.id === sessionId ||
          u.email.toLowerCase() === sessionId.toLowerCase() ||
          (u.username && u.username.toLowerCase() === sessionId.toLowerCase())
      );
      if (demoMatch) {
        user = {
          id: demoMatch.id,
          name: demoMatch.name,
          email: demoMatch.email,
          username: demoMatch.username,
          role: demoMatch.role,
          title: demoMatch.title,
          avatar: demoMatch.avatar,
          phone: demoMatch.phone,
          provider: "demo",
          createdAt: new Date(),
        };

        try {
          await prisma.user.upsert({
            where: { email: demoMatch.email.toLowerCase() },
            update: {
              role: demoMatch.role,
              title: demoMatch.title,
            },
            create: {
              id: demoMatch.id,
              name: demoMatch.name,
              email: demoMatch.email.toLowerCase(),
              username: demoMatch.username.toLowerCase(),
              role: demoMatch.role,
              title: demoMatch.title,
              phone: demoMatch.phone,
              avatar: demoMatch.avatar,
            },
          });
        } catch (syncErr) {
          console.warn("Prisma demo sync in /me error:", syncErr?.message);
        }
      }
    }

    if (!user) {
      const response = NextResponse.json(
        { success: false, authenticated: false, message: "Pengguna tidak ditemukan." },
        { status: 401 }
      );
      response.cookies.delete("pabe_session");
      response.cookies.delete("ygsm_session");
      response.cookies.delete("pabe_role");
      response.cookies.delete("ygsm_role");
      return response;
    }

    // Auto-elevate in session check if designated as super admin
    const isSuper =
      isSuperAdminIdentifier(user.username) ||
      isSuperAdminEmail(user.email);

    if (isSuper && user.role !== USER_ROLES.SUPER_ADMIN) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            role: USER_ROLES.SUPER_ADMIN,
            title: "Super Admin (Ketua Yayasan)",
          },
        });
        user.role = USER_ROLES.SUPER_ADMIN;
        user.title = "Super Admin (Ketua Yayasan)";
      } catch (elevateErr) {
        console.warn("Auto-elevating user to SUPER_ADMIN in /me error:", elevateErr.message);
        user.role = USER_ROLES.SUPER_ADMIN;
        user.title = "Super Admin (Ketua Yayasan)";
      }
    }

    const response = NextResponse.json({
      success: true,
      authenticated: true,
      data: {
        ...user,
        initials: (user.name || user.email).slice(0, 2).toUpperCase(),
      },
    });

    const cookieOpts = { path: "/", httpOnly: false, sameSite: "lax" };
    response.cookies.set("pabe_role", user.role, cookieOpts);
    response.cookies.set("ygsm_role", user.role, cookieOpts);
    return response;
  } catch (err) {
    console.error("Fetch current user session error:", err);
    return NextResponse.json(
      { success: false, message: "Gagal memverifikasi sesi." },
      { status: 500 }
    );
  }
}
