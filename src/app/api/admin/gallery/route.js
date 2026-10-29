import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminGalleryItems,
  createGalleryBatch,
  deleteGalleryItemsBatch,
} from "@/services/adminGalleryService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
    USER_ROLES.VOLUNTEER,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "Semua Kategori";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "24", 10);

    const result = await getAdminGalleryItems({ search, category, page, limit });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      },
      categories: result.categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data galeri admin." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? body.items : [body];

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar foto tidak boleh kosong." },
        { status: 400 }
      );
    }

    const created = await createGalleryBatch(items);

    return NextResponse.json(
      {
        success: true,
        message: `${created.count} foto dokumentasi berhasil disimpan.`,
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menyimpan dokumentasi galeri." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids : [];

    if (ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar ID dokumentasi tidak boleh kosong." },
        { status: 400 }
      );
    }

    const result = await deleteGalleryItemsBatch(ids);

    return NextResponse.json({
      success: true,
      message: `${result.count} foto dokumentasi berhasil dihapus.`,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus dokumentasi kegiatan." },
      { status: 500 }
    );
  }
}
