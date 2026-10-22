import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  updateAdminVacancy,
  deleteAdminVacancy,
} from "@/services/adminCareerService";

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateAdminVacancy(id, body);
    return NextResponse.json({
      success: true,
      message: "Lowongan berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui lowongan." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    await deleteAdminVacancy(id);
    return NextResponse.json({
      success: true,
      message: "Lowongan berhasil dihapus.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus lowongan." },
      { status: 500 }
    );
  }
}
