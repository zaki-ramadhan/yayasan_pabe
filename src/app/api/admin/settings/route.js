import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getOrgSettings,
  updateOrgSettings,
} from "@/services/adminSettingsService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const data = await getOrgSettings();
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data pengaturan yayasan." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const updated = await updateOrgSettings(body);

    return NextResponse.json({
      success: true,
      message: "Pengaturan profil dan rekening yayasan berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui pengaturan yayasan." },
      { status: 400 }
    );
  }
}
