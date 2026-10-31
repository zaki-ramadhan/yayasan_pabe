import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminInstagramPosts,
  createInstagramPost,
  deleteInstagramPostsBulk,
} from "@/services/adminInstagramService";
import { logActivity } from "@/services/activityLogService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await getAdminInstagramPosts({ search, page, limit });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data postingan Instagram." },
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
    const created = await createInstagramPost(body);

    return NextResponse.json({
      success: true,
      data: created,
      message: "Postingan Instagram berhasil ditambahkan.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menambahkan postingan Instagram." },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const { user, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    let ids = body?.ids;

    if (ids && typeof ids === "object" && !Array.isArray(ids)) {
      ids = Object.values(ids);
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar ID postingan Instagram untuk dihapus wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await deleteInstagramPostsBulk(ids);

    await logActivity({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: "BULK_DELETE_INSTAGRAM_POSTS",
      targetType: "InstagramPost",
      description: `Menghapus massal ${result.count || ids.length} postingan Instagram`,
      request,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count || ids.length} postingan Instagram berhasil dihapus.`,
      count: result.count,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus postingan Instagram terpilih." },
      { status: 500 }
    );
  }
}

