import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { validatePasswordInput } from "@/lib/validator";
import {
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from "@/services/passwordResetService";

export const dynamic = "force-dynamic";

/**
 * Validasi status token reset (dipakai saat halaman dibuka)
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          isValid: false,
          message: "Token pengaturan ulang kata sandi tidak ditemukan.",
        },
        { status: 400 }
      );
    }

    const verification = await verifyPasswordResetToken(token);

    if (!verification.isValid) {
      return NextResponse.json(
        {
          success: false,
          isValid: false,
          message: verification.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      isValid: true,
      email: verification.email,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        isValid: false,
        message: "Terjadi kesalahan saat memvalidasi token.",
      },
      { status: 500 }
    );
  }
}

/**
 * Memproses perubahan kata sandi baru
 */
export async function POST(request) {
  try {
    const isDev = process.env.NODE_ENV === "development";
    const rateLimitBlocked = isDev
      ? null
      : checkRateLimit(request, {
          action: "auth_reset_password",
          limit: 5,
          windowMs: 15 * 60 * 1000,
        });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json().catch(() => ({}));
    const { token, newPassword } = body || {};

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Token pengaturan ulang kata sandi tidak valid.",
        },
        { status: 400 }
      );
    }

    const passwordCheck = validatePasswordInput(newPassword, "Kata sandi baru");
    if (!passwordCheck.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: passwordCheck.message,
        },
        { status: 400 }
      );
    }

    const result = await resetPasswordWithToken(token, newPassword);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API POST /api/auth/reset-password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengatur ulang kata sandi.",
      },
      { status: 400 }
    );
  }
}
