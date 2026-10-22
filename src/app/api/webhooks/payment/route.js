import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Webhook Handler untuk Otomasi Payment Gateway (Midtrans, Xendit, Tripay, QRIS, dll).
 * Menghilangkan kebutuhan verifikasi manual; transaksi auto-settle status PAID seketika.
 */
export async function POST(request) {
  try {
    const payload = await request.json();

    // Normalisasi field dari berbagai jenis payment gateway
    const invoiceId = payload.invoiceId || payload.order_id || payload.reference;
    const rawStatus = (
      payload.status ||
      payload.transaction_status ||
      payload.payment_status ||
      ""
    ).toUpperCase();

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Parameter invoiceId tidak ditemukan dalam payload webhook." },
        { status: 400 }
      );
    }

    // Tentukan apakah pembayaran berhasil
    const isPaid =
      rawStatus === "PAID" ||
      rawStatus === "SETTLEMENT" ||
      rawStatus === "SUCCESS" ||
      rawStatus === "CAPTURE";

    if (!isPaid) {
      return NextResponse.json({
        success: true,
        message: `Status ${rawStatus} dicatat, belum final settlement.`,
      });
    }

    // Eksekusi atomik: update status donasi dan akumulasikan perolehan dana kampanye
    const updated = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.findUnique({
        where: { invoiceId },
      });

      if (!donation) {
        return null;
      }

      if (donation.status === "PAID") {
        return donation;
      }

      const settled = await tx.donation.update({
        where: { invoiceId },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      if (donation.campaignId) {
        await tx.campaign.update({
          where: { id: donation.campaignId },
          data: {
            collectedAmount: { increment: donation.amount },
            donorCount: { increment: 1 },
          },
        });
      }

      return settled;
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Data donasi dengan nomor invoice tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoiceId} berhasil diproses otomatis menjadi PAID.`,
      data: {
        invoiceId: updated.invoiceId,
        status: updated.status,
        paidAt: updated.paidAt,
      },
    });
  } catch (error) {
    console.error("Payment webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal pada pemrosesan webhook gateway." },
      { status: 500 }
    );
  }
}
