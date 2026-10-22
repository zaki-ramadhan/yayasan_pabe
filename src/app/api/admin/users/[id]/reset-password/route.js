import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { resetAdminUserPassword } from "@/services/adminUserService";

export async function POST(request, { params }) {
  const { user: authUser, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const result = await resetAdminUserPassword(id);
    return NextResponse.json({
      success: true,
      message: "Kata sandi sementara berhasil dibuat.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mereset kata sandi pengurus." },
      { status: 400 }
    );
  }
}
