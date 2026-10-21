import { NextResponse } from "next/server";
import { updateDonorPassword } from "@/services/donorService";
import { requireAuth } from "@/lib/serverAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import { validatePasswordInput } from "@/lib/security";

export async function PUT(request) {
  // 1. Rate Limiting ketat untuk mutasi kata sandi (Maks 5 per menit per IP untuk mencegah brute-force)
  const rateLimitResponse = checkRateLimit(request, {
    action: "update_password",
    limit: 5,
    windowMs: 60000,
  });
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Autentikasi Pengguna
  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    // 3. Validasi Keberadaan Kata Sandi Saat Ini
    if (!oldPassword || typeof oldPassword !== "string" || !oldPassword.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi saat ini wajib diisi untuk verifikasi keamanan.",
        },
        { status: 400 }
      );
    }

    // 4. Validasi Kata Sandi Baru
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

    // 5. Cegah kesamaan dengan kata sandi saat ini
    if (oldPassword === newPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi baru harus berbeda dari kata sandi saat ini.",
        },
        { status: 400 }
      );
    }

    // Always enforce the authenticated user's email (Anti-IDOR)
    const result = await updateDonorPassword({
      userEmail: authUser.email,
      oldPassword,
      newPassword,
    });

    return NextResponse.json({
      success: true,
      message: result.message,
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
