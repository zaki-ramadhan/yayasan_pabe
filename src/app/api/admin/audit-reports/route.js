import { NextResponse } from "next/server";
import {
  getAdminAuditReports,
  createAuditReport,
  updateAuditReport,
  deleteAuditReport,
  deleteAuditReportsBatch,
} from "@/services/auditReportAdminService";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.FINANCE];

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const reports = await getAdminAuditReports({ search });
    return NextResponse.json({ success: true, data: reports });
  } catch (error) {
    console.error("GET /api/admin/audit-reports error:", error);
    return NextResponse.json({ success: false, message: "Gagal memuat laporan audit." }, { status: 500 });
  }
}

export async function POST(request) {
  const { user, errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const report = await createAuditReport({
      ...body,
      actorId: user.id,
      actorName: user.name || "Admin",
      actorRole: user.role || "ADMIN",
    });

    return NextResponse.json({
      success: true,
      message: "Laporan audit keuangan berhasil ditambahkan.",
      data: report,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menambahkan laporan audit." },
      { status: 400 }
    );
  }
}

export async function PUT(request) {
  const { user, errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const report = await updateAuditReport({
      ...body,
      actorId: user.id,
      actorName: user.name || "Admin",
      actorRole: user.role || "ADMIN",
    });

    return NextResponse.json({
      success: true,
      message: "Laporan audit berhasil diperbarui.",
      data: report,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui laporan audit." },
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
        const result = await deleteAuditReportsBatch({ ids });
        return NextResponse.json({
          success: true,
          message: `${result.count} laporan audit berhasil dihapus.`,
          data: result,
        });
      }

      return NextResponse.json(
        { success: false, message: "ID laporan audit wajib disertakan." },
        { status: 400 }
      );
    }

    const deleted = await deleteAuditReport({
      id,
      actorId: user.id,
      actorName: user.name || "Admin",
      actorRole: user.role || "ADMIN",
    });

    return NextResponse.json({
      success: true,
      message: "Laporan audit berhasil dihapus.",
      data: deleted,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal menghapus laporan audit." },
      { status: 400 }
    );
  }
}
