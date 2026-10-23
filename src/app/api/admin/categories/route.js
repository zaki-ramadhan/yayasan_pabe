import { NextResponse } from "next/server";
import {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/services/categoryService";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN];

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const categories = await getAdminCategories({ search });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat kategori." }, { status: 500 });
  }
}

export async function POST(request) {
  const { user, errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const category = await createCategory({
      ...body,
      actorId: user.id,
      actorName: user.name || "Admin",
      actorRole: user.role || "ADMIN",
    });

    return NextResponse.json({
      success: true,
      message: "Kategori baru berhasil ditambahkan.",
      data: category,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menambahkan kategori." },
      { status: 400 }
    );
  }
}

export async function PUT(request) {
  const { user, errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const category = await updateCategory({
      ...body,
      actorId: user.id,
      actorName: user.name || "Admin",
      actorRole: user.role || "ADMIN",
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil diperbarui.",
      data: category,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui kategori." },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const { user, errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, message: "ID kategori wajib diisi." }, { status: 400 });
    }

    const deleted = await deleteCategory({
      id,
      actorId: user.id,
      actorName: user.name || "Admin",
      actorRole: user.role || "ADMIN",
    });

    return NextResponse.json({
      success: true,
      message: "Kategori berhasil dihapus.",
      data: deleted,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus kategori." },
      { status: 400 }
    );
  }
}
