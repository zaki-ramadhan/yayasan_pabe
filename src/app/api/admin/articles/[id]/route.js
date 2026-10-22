import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  updateAdminArticle,
  deleteAdminArticle,
} from "@/services/adminArticleService";

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateAdminArticle(id, body);
    return NextResponse.json({
      success: true,
      message: "Artikel berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui artikel." },
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
    await deleteAdminArticle(id);
    return NextResponse.json({
      success: true,
      message: "Artikel berhasil dihapus.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus artikel." },
      { status: 500 }
    );
  }
}
