import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { updateAdminCampaign } from "@/services/adminService";

export async function PUT(request, { params }) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    const updated = await updateAdminCampaign(id, body);
    return NextResponse.json({
      success: true,
      message: "Data program donasi berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui program." },
      { status: 500 }
    );
  }
}
