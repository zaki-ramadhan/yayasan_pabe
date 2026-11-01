import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { USER_ROLES } from "@/services/authService";
import { hashPassword } from "@/lib/serverAuth";
import { sendActivationEmailWorkflow } from "@/services/accountActivationService";
import {
  stripEmojis,
  validateEmail,
  validatePhone,
  validateName,
  validateUsername,
} from "@/lib/security";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "auth_register",
      limit: 5,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json();
    const { name, fullName, username, email, phone, password } = body || {};

    // 1. Sanitize & Validate Nama Lengkap (mengizinkan spasi, min 2 max 60)
    const rawName = (name || fullName || username || "").trim();
    const nameValidation = validateName(rawName);
    if (!nameValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: nameValidation.message,
        },
        { status: 400 }
      );
    }
    const cleanName = nameValidation.sanitized;

    // 2. Validate Email & DNS Domain
    const cleanEmail = String(email || "").trim().toLowerCase();
    const emailValidation = await verifyEmailDomainDns(cleanEmail, {
      isRequired: true,
      allowDisposable: false,
      allowRole: false,
    });
    if (!emailValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: emailValidation.message || "Format email tidak valid (contoh: nama@email.com).",
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

    // 5. Generate Collision-free Username untuk database
    let candidateUsername = "";
    if (username && typeof username === "string" && username.trim()) {
      const uVal = validateUsername(username);
      if (uVal.isValid) candidateUsername = uVal.sanitized;
    }

    if (!candidateUsername) {
      let base = cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_|_$/g, "")
        .slice(0, 20);

      if (!base || base.length < 3) {
        base = cleanEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 18) || "donatur";
      }

      candidateUsername = base;
      let counter = 1;
      while (true) {
        const clash = await prisma.user.findFirst({
          where: { username: candidateUsername },
          select: { id: true },
        });
        if (!clash) break;
        counter++;
        candidateUsername = `${base.slice(0, 16)}_${counter}`;
      }
    }
    const cleanUsername = candidateUsername;

    // 6. Check if email already exists in DB
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          ...(username ? [{ username: cleanUsername }] : []),
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
            ? "Email sudah terdaftar. Silakan masuk ke akun Anda."
            : "Nama pengguna ini sudah digunakan. Silakan pilih nama pengguna lain.",
        },
        { status: 409 }
      );
    }

    // 7. Hash Password & Create User in DB (Status isActive: false sampai email diaktivasi)
    const passwordHash = hashPassword(cleanPassword);
    const assignedRole = USER_ROLES.DONOR;
    const assignedTitle = "Donatur";

    const createdUser = await prisma.user.create({
      data: {
        name: cleanName,
        username: cleanUsername,
        email: cleanEmail,
        phone: cleanPhone,
        passwordHash,
        role: assignedRole,
        title: assignedTitle,
        avatar: null,
        isActive: false, // Wajib aktivasi email sebelum bisa login
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        title: true,
        createdAt: true,
      },
    });

    // 7. Kirim Email Aktivasi Akun Berisi Token Verifikasi (24 Jam)
    try {
      const originUrl = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL;
      await sendActivationEmailWorkflow({
        email: cleanEmail,
        name: formattedName,
        originUrl,
      });
    } catch (emailErr) {
      console.error("[Register] Gagal mengirim email aktivasi:", emailErr.message);
      // Akun tetap terdaftar belum aktif, user dapat meminta kirim ulang di layar berikutnya
    }

    // 8. Kembalikan respon sukses verifikasi (TANPA cookie sesi login)
    return NextResponse.json(
      {
        success: true,
        requireVerification: true,
        email: cleanEmail,
        message: "Pendaftaran berhasil! Tautan aktivasi telah dikirimkan ke email Anda. Silakan verifikasi email Anda sebelum masuk.",
      },
      { status: 201 }
    );
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
