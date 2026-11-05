import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { settleDonationStatus } from "@/services/donationService";

/**
 * Development-only API endpoint untuk simulasi mutasi status tagihan donasi.
 * Dibatasi secara mutlak hanya untuk lingkungan development.
 */
export async function POST(request) {
  // Hard guard: 100% diblokir jika bukan development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { success: false, message: "Akses ditolak. Fitur simulasi hanya tersedia pada mode development." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { invoiceId, action } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Parameter invoiceId diperlukan." },
        { status: 400 }
      );
    }

    const donation = await prisma.donation.findUnique({
      where: { invoiceId },
    });

    if (!donation) {
      return NextResponse.json(
        { success: false, message: "Data donasi tidak ditemukan." },
        { status: 404 }
      );
    }

    // 1. Simulasi Pembayaran Berhasil (PAID)
    if (action === "PAID") {
      const settled = await settleDonationStatus(invoiceId, new Date());

      return NextResponse.json({
        success: true,
        message: "Simulasi pembayaran berhasil! Status donasi sekarang LUNAS (PAID).",
        status: "PAID",
        paidAt: settled?.paidAt || new Date(),
      });
    }

    // 2. Simulasi Waktu Pembayaran Habis (EXPIRED)
    if (action === "EXPIRED") {
      await prisma.donation.update({
        where: { invoiceId },
        data: {
          status: "EXPIRED",
          expiredAt: new Date(Date.now() - 1000), // set waktu lampau
        },
      });
      return NextResponse.json({
        success: true,
        message: "Simulasi kedaluwarsa berhasil! Status donasi sekarang KEDALUWARSA (EXPIRED).",
        status: "EXPIRED",
      });
    }

    // 3. Reset Status kembali ke Menunggu (PENDING) untuk kemudahan pengujian berulang
    if (action === "RESET_PENDING") {
      await prisma.donation.update({
        where: { invoiceId },
        data: {
          status: "PENDING",
          paidAt: null,
          expiredAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // perpanjang 24 jam
        },
      });
      return NextResponse.json({
        success: true,
        message: "Status donasi berhasil dikembalikan ke MENUNGGU PEMBAYARAN (PENDING).",
        status: "PENDING",
      });
    }

    return NextResponse.json(
      { success: false, message: "Aksi tidak valid. Pilih: PAID, EXPIRED, atau RESET_PENDING." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Dev simulation status error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses simulasi status." },
      { status: 500 }
    );
  }
}
