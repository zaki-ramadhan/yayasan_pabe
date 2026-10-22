import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminApplications,
  updateApplicationStatus,
} from "@/services/adminCareerService";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const vacancyId = searchParams.get("vacancyId") || "";
    const status = searchParams.get("status") || "";

    const applications = await getAdminApplications({ vacancyId, status });
    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data pelamar." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { applicationId, status } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, message: "ID pelamar dan status baru wajib dikirim." },
        { status: 400 }
      );
    }

    const updated = await updateApplicationStatus(applicationId, status);
    return NextResponse.json({
      success: true,
      message: "Status pelamar berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui status pelamar." },
      { status: 500 }
    );
  }
}
