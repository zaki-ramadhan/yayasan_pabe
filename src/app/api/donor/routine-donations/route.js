import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function PATCH(request) {
  try {
    const { user } = await getAuthenticatedUser(request);
    const body = await request.json();
    const { id, status } = body;

    if (!id || !["ACTIVE", "PAUSED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { success: false, message: "Parameter status donasi rutin tidak valid." },
        { status: 400 }
      );
    }

    // Pastikan milik user yang login jika ada session
    const existing = await prisma.routineDonation.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Data donasi rutin tidak ditemukan." },
        { status: 404 }
      );
    }

    if (user?.email && existing.donorEmail && existing.donorEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Akses tidak sah untuk mengubah data ini." },
        { status: 403 }
      );
    }

    const updated = await prisma.routineDonation.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      success: true,
      message:
        status === "PAUSED"
          ? "Donasi rutin berhasil dijeda sementara."
          : status === "ACTIVE"
          ? "Donasi rutin berhasil diaktifkan kembali."
          : "Donasi rutin berhasil dibatalkan.",
      data: updated,
    });
  } catch (error) {
    console.error("PATCH /api/donor/routine-donations error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memperbarui status donasi rutin." },
      { status: 500 }
    );
  }
}
