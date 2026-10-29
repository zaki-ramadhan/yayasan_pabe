import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getAdminInstagramProfile,
  updateAdminInstagramProfile,
} from "@/services/adminInstagramService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const profile = await getAdminInstagramProfile();
    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil profil Instagram." },
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
    const updated = await updateAdminInstagramProfile(body);

    revalidatePath("/admin/instagram");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      data: updated,
      message: "Profil akun Instagram berhasil diperbarui.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui profil Instagram." },
      { status: 400 }
    );
  }
}
