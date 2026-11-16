import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import {
  getOrgSettings,
  updateStructureImage,
} from "@/services/adminSettingsService";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = [USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN];

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const settings = await getOrgSettings();
    return NextResponse.json({
      success: true,
      data: {
        structureImage: settings.structureImage || null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal mengambil data gambar struktur yayasan.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { user, errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { structureImage } = body;

    const result = await updateStructureImage(structureImage, user);

    revalidatePath("/admin/pengguna");
    revalidatePath("/tentang-kami");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Bagan struktur organisasi berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memperbarui bagan struktur organisasi.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE(request) {
  const { user, errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const result = await updateStructureImage(null, user);

    revalidatePath("/admin/pengguna");
    revalidatePath("/tentang-kami");
    revalidatePath("/");

    return NextResponse.json({
      success: true,
      message: "Bagan struktur organisasi berhasil dikembalikan ke default.",
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menghapus bagan struktur organisasi.",
      },
      { status: 400 }
    );
  }
}

