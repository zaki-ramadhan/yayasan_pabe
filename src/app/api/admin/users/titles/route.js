import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { getDistinctStaffTitles } from "@/services/leadershipService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const titles = await getDistinctStaffTitles();
    return NextResponse.json({ success: true, data: titles });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil daftar jabatan pengurus." },
      { status: 500 }
    );
  }
}
