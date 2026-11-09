import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { settleDonationStatus, buildAdminDonationEventPayload } from "@/services/donationService";
import { broadcastAdminEvent } from "@/lib/sseBroadcast";

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

    const previousStatus = donation.status;
    const wasPaid = previousStatus === "PAID";

    // 1. Simulasi Pembayaran Berhasil (PAID)
    if (action === "PAID") {
      if (donation.status === "PAID") {
        return NextResponse.json({
          success: true,
          message: "Donasi sudah berstatus LUNAS (PAID). Tidak ada perubahan nominal.",
          status: "PAID",
          paidAt: donation.paidAt || new Date(),
        });
      }

      const settled = await settleDonationStatus(invoiceId, new Date());

      return NextResponse.json({
        success: true,
        message: "Simulasi pembayaran berhasil! Status donasi sekarang LUNAS (PAID).",
        status: "PAID",
        paidAt: settled?.paidAt || new Date(),
      });
    }

    // 2. Simulasi Waktu Pembayaran Habis (EXPIRED), Pembatalan (CANCELLED), atau Reset ke Menunggu (PENDING)
    if (action === "EXPIRED" || action === "CANCELLED" || action === "RESET_PENDING") {
      const targetStatus =
        action === "RESET_PENDING"
          ? "PENDING"
          : action === "EXPIRED"
          ? "EXPIRED"
          : "CANCELLED";

      if (donation.status === targetStatus) {
        return NextResponse.json({
          success: true,
          message: `Status donasi sudah ${targetStatus}. Tidak ada perubahan.`,
          status: targetStatus,
        });
      }

      const updated = await prisma.$transaction(async (tx) => {
        const donationDoc = await tx.donation.update({
          where: { invoiceId },
          data: {
            status: targetStatus,
            paidAt: null,
            expiredAt:
              targetStatus === "EXPIRED"
                ? new Date(Date.now() - 1000)
                : targetStatus === "PENDING"
                ? new Date(Date.now() + 24 * 60 * 60 * 1000)
                : donation.expiredAt,
          },
          include: {
            campaign: { select: { id: true, title: true, slug: true } },
          },
        });

        // Rekonsiliasi atomik total program jika status sebelumnya PAID (Rollback donasi)
        if (donation.campaignId) {
          const agg = await tx.donation.aggregate({
            where: { campaignId: donation.campaignId, status: "PAID" },
            _sum: { amount: true },
            _count: { id: true },
          });

          await tx.campaign.update({
            where: { id: donation.campaignId },
            data: {
              collectedAmount: Number(agg._sum.amount || 0),
              donorCount: Number(agg._count.id || 0),
            },
          });
        }

        return donationDoc;
      });

      try {
        broadcastAdminEvent(
          "DONATION_UPDATED",
          buildAdminDonationEventPayload(updated, { previousStatus })
        );
      } catch {}

      return NextResponse.json({
        success: true,
        message: `Status donasi berhasil diubah ke ${targetStatus}.${wasPaid ? " Nominal donasi sebelumnya berhasil di-rollback dari total program." : ""}`,
        status: targetStatus,
      });
    }

    return NextResponse.json(
      { success: false, message: "Aksi tidak valid. Pilih: PAID, EXPIRED, CANCELLED, atau RESET_PENDING." },
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
