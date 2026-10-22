import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { DEMO_USERS, USER_ROLES } from "@/services/authService";
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

    // 2. If user exists in DB and has passwordHash, strictly verify password
    if (user && user.passwordHash) {
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

    // 3. Fallback to DEMO_USERS if user not found in DB
    if (!user) {
      const demoMatch = DEMO_USERS.find(
        (u) =>
          u.email.toLowerCase() === cleanIdentifier ||
          (u.username && u.username.toLowerCase() === cleanIdentifier)
      );

      if (demoMatch) {
        user = demoMatch;
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
        }
      }
    }

    // 4. If still not found, persist a new real record in Database
    if (!user) {
      const isEmail = cleanIdentifier.includes("@");
      const baseName = isEmail ? cleanIdentifier.split("@")[0] : cleanIdentifier;
      const newEmail = isEmail ? cleanIdentifier : `${cleanIdentifier}@pabe.user`;
      const newUsername = baseName.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 15);
      const hashedPassword = hashPassword(cleanPassword);
      const isSuper = isSuperAdminIdentifier(cleanIdentifier) || isSuperAdminEmail(newEmail);
      const initialRole = isSuper ? USER_ROLES.SUPER_ADMIN : USER_ROLES.DONOR;
      const initialTitle = isSuper ? "Super Admin (Ketua Yayasan)" : "Donatur Terdaftar";

      try {
        user = await prisma.user.create({
          data: {
            name: baseName,
            username: newUsername,
            email: newEmail,
            passwordHash: hashedPassword,
            role: initialRole,
            title: initialTitle,
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          },
        });
      } catch (createErr) {
        console.warn("Prisma user auto-registration fallback:", createErr.message);
        user = {
          id: `USR-${Date.now()}`,
          name: baseName,
          username: newUsername,
          email: newEmail,
          role: initialRole,
          title: initialTitle,
          phone: "-",
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          initials: baseName.slice(0, 2).toUpperCase(),
        };
      }
    }

    // 5. If user matches Super Admin credentials, ensure their role is elevated
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
            title: "Super Admin (Ketua Yayasan)",
          },
        });
      } catch (elevateErr) {
        console.warn("Auto-elevating user to SUPER_ADMIN error:", elevateErr.message);
        user = {
          ...user,
          role: USER_ROLES.SUPER_ADMIN,
          title: "Super Admin (Ketua Yayasan)",
        };
      }
    }

    // Safe user response (exclude passwordHash)
    const safeUser = {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      title: user.title || "Donatur Terdaftar",
      phone: user.phone || "-",
      avatar: user.avatar || "",
      initials: (user.name || user.email).slice(0, 2).toUpperCase(),
    };

    // Calculate cookie expiration: 30 days if rememberMe, else 7 days
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60;
    const cookieOpts = {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge,
    };

    const response = NextResponse.json({
      success: true,
      data: safeUser,
      message: `Selamat datang, ${safeUser.name}!`,
    });

    response.cookies.set("pabe_session", safeUser.id, cookieOpts);
    response.cookies.set("ygsm_session", safeUser.id, cookieOpts);
    response.cookies.set("pabe_role", safeUser.role, { ...cookieOpts, httpOnly: false });
    response.cookies.set("ygsm_role", safeUser.role, { ...cookieOpts, httpOnly: false });

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
