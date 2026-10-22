import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { toggleAdminUserStatus } from "@/services/adminUserService";

export async function PATCH(request, { params }) {
  const { user: authUser, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const updated = await toggleAdminUserStatus(id, authUser);
    return NextResponse.json({
      success: true,
      message: `Status akun pengurus berhasil diubah menjadi ${updated.isActive ? "aktif" : "ditangguhkan"}.`,
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengubah status akun." },
      { status: 400 }
    );
  }
}
