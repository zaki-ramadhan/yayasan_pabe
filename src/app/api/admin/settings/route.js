import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getOrgSettings,
  updateOrgSettings,
} from "@/services/adminSettingsService";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN];

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, ADMIN_ROLES);
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
  const { user, errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const updated = await updateOrgSettings(body, user);

    // Invalidate Next.js server cache agar admin form dan halaman publik langsung menyajikan data terbaru
    revalidatePath("/admin/pengaturan");
    revalidatePath("/tentang-kami");
    revalidatePath("/");

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
