import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { verifyAdminTransaction } from "@/services/adminService";

export async function POST(request, { params }) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const verified = await verifyAdminTransaction(id);

    return NextResponse.json({
      success: true,
      message: "Transaksi donasi berhasil diverifikasi dan dana terakumulasi ke kas program.",
      data: verified,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memverifikasi transaksi donasi." },
      { status: 500 }
    );
  }
}
