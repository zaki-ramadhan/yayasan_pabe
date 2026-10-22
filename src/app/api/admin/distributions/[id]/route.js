import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  updateAdminDistribution,
  deleteAdminDistribution,
} from "@/services/adminService";

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateAdminDistribution(id, body);
    return NextResponse.json({
      success: true,
      message: "Data rekam penyaluran berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui data penyaluran." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    await deleteAdminDistribution(id);

    return NextResponse.json({
      success: true,
      message: "Data rekam penyaluran berhasil dihapus.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus data penyaluran." },
      { status: 500 }
    );
  }
}
