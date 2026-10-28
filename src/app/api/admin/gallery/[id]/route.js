import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { deleteGalleryItem, updateGalleryItem } from "@/services/adminGalleryService";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID foto dokumentasi wajib disertakan." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const updated = await updateGalleryItem(id, body);

    return NextResponse.json({
      success: true,
      message: "Foto dokumentasi berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui dokumentasi galeri." },
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
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID foto dokumentasi wajib disertakan." },
        { status: 400 }
      );
    }

    const deleted = await deleteGalleryItem(id);

    return NextResponse.json({
      success: true,
      message: "Foto dokumentasi berhasil dihapus.",
      data: deleted,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus dokumentasi galeri." },
      { status: 500 }
    );
  }
}
