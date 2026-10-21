import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { USER_ROLES } from "@/services/authService";
import { hashPassword } from "@/lib/serverAuth";
import {
  stripEmojis,
  validateEmail,
  validatePhone,
  validateName,
  validateUsername,
} from "@/lib/security";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, name, email, phone, password } = body || {};

    // 1. Sanitize & Validate Username (dengan proteksi anti-impersonation)
    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: usernameValidation.message,
        },
        { status: 400 }
      );
    }
    const cleanUsername = usernameValidation.sanitized;

    // 1b. Validate Full Name jika dikirimkan oleh klien
    let formattedName = cleanUsername
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    if (name && typeof name === "string" && name.trim()) {
      const nameValidation = validateName(name);
      if (!nameValidation.isValid) {
        return NextResponse.json(
          {
            success: false,
            message: nameValidation.message,
          },
          { status: 400 }
        );
      }
      formattedName = nameValidation.sanitized;
    }

    // 2. Validate Email
    const cleanEmail = String(email || "").trim().toLowerCase();
    const emailValidation = validateEmail(cleanEmail);
    if (!emailValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: emailValidation.message || "Alamat email tidak valid.",
        },
        { status: 400 }
      );
    }

    // 3. Validate Password
    const cleanPassword = typeof password === "string" ? password.trim() : "";
    if (!cleanPassword || cleanPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi wajib diisi minimal 6 karakter.",
        },
        { status: 400 }
      );
    }

    // 4. Validate Phone if provided
    let cleanPhone = "-";
    if (phone) {
      const phoneValidation = validatePhone(phone);
      if (!phoneValidation.isValid) {
        return NextResponse.json(
          {
            success: false,
            message: phoneValidation.message,
          },
          { status: 400 }
        );
      }
      cleanPhone = phone.trim();
    }

    // 5. Check if user already exists in DB
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
      select: { id: true, email: true, username: true },
    });

    if (existingUser) {
      const isEmailMatch = existingUser.email.toLowerCase() === cleanEmail;
      return NextResponse.json(
        {
          success: false,
          message: isEmailMatch
            ? "Alamat email ini sudah terdaftar. Silakan masuk ke akun Anda."
            : "Nama pengguna ini sudah digunakan. Silakan pilih nama pengguna lain.",
        },
        { status: 409 }
      );
    }

    // 6. Hash Password & Create User in DB
    const passwordHash = hashPassword(cleanPassword);

    const createdUser = await prisma.user.create({
      data: {
        name: formattedName,
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: USER_ROLES.DONOR,
        title: "Akun Terverifikasi",
        avatar: null,
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        title: true,
        avatar: true,
        createdAt: true,
      },
    });

    const safeUser = {
      ...createdUser,
      initials: (createdUser.name || createdUser.email).slice(0, 2).toUpperCase(),
    };

    // 7. Establish Server HttpOnly Session Cookie (7 days)
    const cookieOpts = {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
    };

    const response = NextResponse.json(
      {
        success: true,
        data: safeUser,
        message: "Pendaftaran akun donatur berhasil! Selamat datang di Yayasan PABE.",
      },
      { status: 201 }
    );

    response.cookies.set("pabe_session", safeUser.id, cookieOpts);
    response.cookies.set("ygsm_session", safeUser.id, cookieOpts);

    return response;
  } catch (error) {
    console.error("API POST /api/auth/register error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server saat memproses pendaftaran.",
      },
      { status: 500 }
    );
  }
}
