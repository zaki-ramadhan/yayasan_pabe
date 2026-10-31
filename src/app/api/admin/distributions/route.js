import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminDistributions,
  createAdminDistribution,
  deleteAdminDistributionsBatch,
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
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getAdminDistributions({ page, limit });
    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
      campaigns: result.campaigns,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data penyaluran." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();

    if (!body.title || !body.campaignId || !body.disbursedAmount) {
      return NextResponse.json(
        { success: false, message: "Judul, program tujuan, dan nominal alokasi dana wajib diisi." },
        { status: 400 }
      );
    }

    const created = await createAdminDistribution(body);
    return NextResponse.json(
      {
        success: true,
        message: "Dokumentasi penyaluran bantuan mustahik berhasil dicatat.",
        data: created,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mencatat penyaluran bantuan." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
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
        { success: false, message: "Daftar ID penyaluran tidak boleh kosong." },
        { status: 400 }
      );
    }

    const result = await deleteAdminDistributionsBatch(ids);
    return NextResponse.json({
      success: true,
      message: `Berhasil menghapus ${result.count} data rekam penyaluran bantuan.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus data penyaluran terpilih." },
      { status: 500 }
    );
  }
}
