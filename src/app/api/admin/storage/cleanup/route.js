import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { cleanupOrphanFiles } from "@/services/adminStorageService";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { user, errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    let keys = body?.keys;
    if (keys && typeof keys === "object" && !Array.isArray(keys)) {
      keys = Object.values(keys);
    }
    keys = Array.isArray(keys) ? keys : [];

    if (keys.length === 0) {
      return NextResponse.json(
        { success: false, message: "Daftar berkas yang akan dihapus tidak boleh kosong." },
        { status: 400 }
      );
    }

    const result = await cleanupOrphanFiles(keys, {
      userId: user?.id,
      userName: user?.name,
    });

    return NextResponse.json({
      success: result.success,
      message: `${result.deletedCount} berkas sampah berhasil dihapus dari Cloudflare R2.`,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membersihkan berkas R2." },
      { status: 500 }
    );
  }
}
