import { NextResponse } from "next/server";
import { updateDonorPassword } from "@/services/donorService";
import { requireAuth } from "@/lib/serverAuth";

export async function PUT(request) {
  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Kata sandi baru minimal 6 karakter.",
        },
        { status: 400 }
      );
    }

    // Always enforce the authenticated user's email
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
