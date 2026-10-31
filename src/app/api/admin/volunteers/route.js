import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminVolunteers,
  updateVolunteerStatus,
  updateVolunteersStatusBatch,
  deleteVolunteer,
  deleteVolunteersBatch,
} from "@/services/adminVolunteerService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.VOLUNTEER,
    USER_ROLES.FINANCE,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const result = await getAdminVolunteers({ search, status, page, limit });
    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: result.pagination,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data relawan." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    let { id, ids, status } = body;
    if (ids && typeof ids === "object" && !Array.isArray(ids)) {
      ids = Object.values(ids);
    }

    if (!status) {
      return NextResponse.json(
        { success: false, message: "Status baru relawan wajib dikirim." },
        { status: 400 }
      );
    }

    if (Array.isArray(ids) && ids.length > 0) {
      const result = await updateVolunteersStatusBatch(ids, status);
      return NextResponse.json({
        success: true,
        message: `${result.count} data pendaftar relawan berhasil diperbarui menjadi ${status}.`,
        data: result,
      });
    }

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID relawan wajib dikirim." },
        { status: 400 }
      );
    }

    const updated = await updateVolunteerStatus(id, status);
    return NextResponse.json({
      success: true,
      message: "Status relawan berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui status relawan." },
      { status: 400 }
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      let body;
      try {
        body = await request.json();
      } catch {
        body = null;
      }

      let ids = body?.ids;
      if (ids && typeof ids === "object" && !Array.isArray(ids)) {
        ids = Object.values(ids);
      }

      if (Array.isArray(ids) && ids.length > 0) {
        const result = await deleteVolunteersBatch(ids);
        return NextResponse.json({
          success: true,
          message: `${result.count} pendaftar relawan berhasil dihapus.`,
          data: result,
        });
      }

      return NextResponse.json(
        { success: false, message: "ID relawan wajib disertakan." },
        { status: 400 }
      );
    }

    await deleteVolunteer(id);
    return NextResponse.json({
      success: true,
      message: "Data pendaftar relawan berhasil dihapus.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus data relawan." },
      { status: 500 }
    );
  }
}
