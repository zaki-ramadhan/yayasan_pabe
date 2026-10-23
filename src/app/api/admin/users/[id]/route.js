import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { updateAdminUser, deleteAdminUser } from "@/services/adminUserService";

export async function PATCH(request, { params }) {
  const { user: authUser, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    const body = await request.json();
    const updated = await updateAdminUser(id, body, authUser);

    return NextResponse.json({
      success: true,
      message: "Data pengurus berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui data pengurus." },
      { status: 400 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { user: authUser, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  const { id } = await params;

  try {
    await deleteAdminUser(id, authUser);

    return NextResponse.json({
      success: true,
      message: "Pengurus berhasil dihapus.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus pengurus." },
      { status: 400 }
    );
  }
}
