import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminArticles,
  createAdminArticle,
  deleteAdminArticlesBatch,
} from "@/services/adminArticleService";
import { logActivity } from "@/services/activityLogService";

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
    const category = searchParams.get("category") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getAdminArticles({ search, category, page, limit });
    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      categories: result.categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data artikel." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { user, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    if (!body.title || !body.content) {
      return NextResponse.json(
        { success: false, message: "Judul dan konten artikel wajib diisi." },
        { status: 400 }
      );
    }

    const article = await createAdminArticle(body);

    await logActivity({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: "CREATE_ARTICLE",
      targetType: "Article",
      targetId: article?.id,
      description: `Menerbitkan artikel baru: "${article?.title}"`,
      request,
    });

    return NextResponse.json({
      success: true,
      message: "Artikel berita berhasil diterbitkan.",
      data: article,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat artikel baru." },
      { status: 500 }
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
        { success: false, message: "Daftar ID artikel untuk dihapus wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await deleteAdminArticlesBatch(ids);

    await logActivity({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: "DELETE_ARTICLES_BATCH",
      targetType: "Article",
      description: `Menghapus ${result.count} artikel secara massal`,
      request,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} artikel berhasil dihapus.`,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus artikel secara massal." },
      { status: 500 }
    );
  }
}
