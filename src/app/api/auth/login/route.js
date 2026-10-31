import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEMO_USERS, USER_ROLES, getSessionDuration } from "@/services/authService";
import { verifyPassword, hashPassword, isSuperAdminEmail, isSuperAdminIdentifier } from "@/lib/serverAuth";
import { stripEmojis } from "@/lib/security";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "auth_login",
      limit: 10,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json();
    const { identifier, password, rememberMe } = body || {};

    const cleanIdentifier = stripEmojis(identifier || "").trim().toLowerCase();
    const cleanPassword = typeof password === "string" ? password.trim() : "";

    if (!cleanIdentifier || cleanIdentifier.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama pengguna atau email wajib diisi minimal 3 karakter.",
        },
        { status: 400 }
      );
    }

    if (!cleanPassword || cleanPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi wajib diisi minimal 6 karakter.",
        },
        { status: 400 }
      );
    }

    // 1. Look up user in Database
    let user = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: cleanIdentifier, mode: "insensitive" } },
            { username: { equals: cleanIdentifier, mode: "insensitive" } },
          ],
        },
      });
    } catch (dbErr) {
      console.warn("DB login lookup fallback:", dbErr.message);
    }

    // 2. If user exists in DB, verify password hash
    if (user) {
      if (!user.passwordHash) {
        return NextResponse.json(
          {
            success: false,
            message: "Akun ini terdaftar melalui penyedia OAuth (Google / Facebook). Silakan masuk menggunakan tombol penyedia tersebut.",
          },
          { status: 400 }
        );
      }

      const isValid = verifyPassword(cleanPassword, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          {
            success: false,
            message: "Kata sandi yang Anda masukkan tidak cocok.",
          },
          { status: 401 }
        );
      }
    }

    // 3. Fallback to DEMO_USERS in development / demo mode only
    if (!user && (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO_LOGIN === "true")) {
      const demoMatch = DEMO_USERS.find(
        (u) =>
          u.email.toLowerCase() === cleanIdentifier ||
          (u.username && u.username.toLowerCase() === cleanIdentifier)
      );

      if (demoMatch) {
        try {
          user = await prisma.user.upsert({
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
              passwordHash: hashPassword(cleanPassword),
              role: demoMatch.role,
              title: demoMatch.title,
              phone: demoMatch.phone,
              avatar: demoMatch.avatar,
            },
          });
        } catch (dbUpsertErr) {
          console.warn("Demo user db sync fallback:", dbUpsertErr.message);
          user = demoMatch;
        }
      }
    }

    // 4. Reject if account does not exist
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Kredensial tidak valid. Akun dengan email atau nama pengguna tersebut tidak ditemukan.",
        },
        { status: 401 }
      );
    }

    // 5. If user matches configured Super Admin email/identifier, ensure role consistency
    const isSuper =
      isSuperAdminIdentifier(cleanIdentifier) ||
      (user && isSuperAdminIdentifier(user.username)) ||
      (user && isSuperAdminEmail(user.email));

    if (user && isSuper && user.role !== USER_ROLES.SUPER_ADMIN) {
      try {
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: USER_ROLES.SUPER_ADMIN,
            title: "Super Admin",
          },
        });
      } catch (elevateErr) {
        console.warn("Syncing SUPER_ADMIN role error:", elevateErr.message);
      }
    }

    const cleanTitle = (user.title && user.title.includes("Ketua Yayasan")) ? "Super Admin" : (user.title || "Donatur Terdaftar");

    // Calculate cookie expiration: 12-24h for Staff, 7-30d for Donors via SSOT helper
    const durationSec = getSessionDuration(user.role, rememberMe);
    const expiresAt = Date.now() + durationSec * 1000;

    // Safe user response (exclude passwordHash)
    const safeUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      title: cleanTitle,
      phone: user.phone || "-",
      avatar: user.avatar || "",
      initials: (user.name || user.email).slice(0, 2).toUpperCase(),
      expiresAt,
      sessionIssuedAt: Date.now(),
    };

    const cookieOpts = {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: durationSec,
    };

    const response = NextResponse.json({
      success: true,
      data: safeUser,
      message: `Selamat datang, ${safeUser.name}!`,
    });

    response.cookies.set("pabe_session", safeUser.id, cookieOpts);
    response.cookies.set("pabe_role", safeUser.role, { ...cookieOpts, httpOnly: false });

    return response;
  } catch (error) {
    console.error("API POST /api/auth/login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server saat memproses login.",
      },
      { status: 500 }
    );
  }
}
