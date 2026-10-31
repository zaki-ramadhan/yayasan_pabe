import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminCampaigns,
  createAdminCampaign,
  deleteAdminCampaignsBulk,
} from "@/services/adminService";
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
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getAdminCampaigns({ search, status, page, limit });
    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      categories: result.categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data program." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { user: authUser, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    if (!body.title || (!body.categoryId && !body.newCategoryName)) {
      return NextResponse.json(
        { success: false, message: "Judul program dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const campaign = await createAdminCampaign(body);
    return NextResponse.json(
      {
        success: true,
        message: "Program donasi baru berhasil dipublikasikan.",
        data: campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat program baru." },
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
        { success: false, message: "Daftar ID program untuk dihapus wajib disertakan." },
        { status: 400 }
      );
    }

    const result = await deleteAdminCampaignsBulk(ids);

    await logActivity({
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      action: "BULK_DELETE_CAMPAIGNS",
      targetType: "Campaign",
      description: `Menghapus massal ${result.count || ids.length} program donasi`,
      request,
    });

    return NextResponse.json({
      success: true,
      message: `${result.count || ids.length} program donasi berhasil dihapus.`,
      count: result.count,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus program terpilih." },
      { status: 400 }
    );
  }
}

