import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminCampaigns,
  createAdminCampaign,
} from "@/services/adminService";

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
