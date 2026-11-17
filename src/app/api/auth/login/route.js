import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEMO_USERS, USER_ROLES, getSessionDuration } from "@/services/authService";
import { verifyPassword, hashPassword, isSuperAdminEmail, isSuperAdminIdentifier, createSignedSessionToken } from "@/lib/serverAuth";
import { stripEmojis } from "@/lib/security";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyTurnstileToken } from "@/lib/turnstile";

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
    const { identifier, password, rememberMe, turnstileToken } = body || {};

    const clientIp = getClientIp(request);
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: turnstileCheck.message || "Verifikasi keamanan Turnstile gagal.",
          errorCodes: turnstileCheck.errorCodes,
        },
        { status: 403 }
      );
    }

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

    if (user?.email?.endsWith("@internal.yayasanpayungberkah.org")) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun Anda belum memiliki izin untuk mengakses halaman pengurus.",
        },
        { status: 403 }
      );
    }

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

      if (user.isActive === false) {
        return NextResponse.json(
          {
            success: false,
            code: "ACCOUNT_NOT_ACTIVATED",
            message: "Akun Anda belum aktif. Silakan periksa inbox email Anda untuk mengklik tautan aktivasi.",
            email: user.email,
          },
          { status: 403 }
        );
      }
    }

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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Kredensial tidak valid. Akun dengan email atau nama pengguna tersebut tidak ditemukan.",
        },
        { status: 401 }
      );
    }

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

    const durationSec = getSessionDuration(user.role, rememberMe);
    const expiresAt = Date.now() + durationSec * 1000;

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

    const signedToken = createSignedSessionToken(
      { id: safeUser.id, email: safeUser.email, role: safeUser.role },
      durationSec
    );

    safeUser.sessionToken = signedToken;

    const response = NextResponse.json({
      success: true,
      data: safeUser,
      message: `Selamat datang, ${safeUser.name}!`,
    });

    response.cookies.set("pabe_session", signedToken, cookieOpts);
    response.cookies.set("pabe_role", safeUser.role, { ...cookieOpts, httpOnly: false });

    return response;
  } catch (error) {
    console.error("API POST /api/auth/login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal memproses masuk ke akun. Silakan coba beberapa saat lagi.",
      },
      { status: 500 }
    );
  }
}
