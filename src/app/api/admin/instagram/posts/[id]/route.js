import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  updateInstagramPost,
  deleteInstagramPost,
} from "@/services/adminInstagramService";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateInstagramPost(id, body);

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Postingan Instagram berhasil diperbarui.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui postingan Instagram." },
      { status: 400 }
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
    await deleteInstagramPost(id);

    return NextResponse.json({
      success: true,
      message: "Postingan Instagram berhasil dihapus.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus postingan Instagram." },
      { status: 400 }
    );
  }
}
