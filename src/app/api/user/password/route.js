import { NextResponse } from "next/server";
import { updateDonorPassword } from "@/services/donorService";
import { requireAuth } from "@/lib/serverAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import { validatePasswordInput } from "@/lib/security";

export async function PUT(request) {
  const rateLimitResponse = checkRateLimit(request, {
    action: "update_password",
    limit: 5,
    windowMs: 60000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || typeof oldPassword !== "string" || !oldPassword.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi saat ini wajib diisi untuk verifikasi keamanan.",
        },
        { status: 400 }
      );
    }

    const newPassValidation = validatePasswordInput(newPassword, "Kata sandi baru");
    if (!newPassValidation.isValid) {
      return NextResponse.json(
        {
          success: false,
          message: newPassValidation.message,
        },
        { status: 400 }
      );
    }

    if (oldPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi baru harus berbeda dari kata sandi saat ini.",
        },
        { status: 400 }
      );
    }

    const result = await updateDonorPassword({
      userEmail: authUser.email,
      oldPassword,
      newPassword,
    });

    return NextResponse.json({
      success: true,
      message: result.message || "Kata sandi akun Anda berhasil diperbarui.",
    });
  } catch (error) {
    console.error("API PUT /api/user/password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memperbarui kata sandi.",
      },
      { status: 400 }
    );
  }
}
