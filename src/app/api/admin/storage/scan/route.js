import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { scanOrphanFiles } from "@/services/adminStorageService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const minAgeHours = parseInt(searchParams.get("minAge") || "0", 10);

    const result = await scanOrphanFiles({ minAgeHours });
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memindai berkas tak terpakai." },
      { status: 500 }
    );
  }
}
