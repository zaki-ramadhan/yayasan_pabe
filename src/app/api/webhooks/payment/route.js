import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseMidtransNotification } from "@/services/midtransService";
import { isMidtransProduction } from "@/lib/midtransConfig";

/**
 * Webhook Handler untuk Otomasi Payment Gateway (Midtrans resmi, serta fallback multi-gateway).
 * Menjamin verifikasi signature SHA-512 dan mutasi database atomik (ACID).
 */
export async function POST(request) {
  try {
    const payload = await request.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { success: false, message: "Format payload webhook tidak valid." },
        { status: 400 }
      );
    }

    const isMidtransPayload = Boolean(payload.signature_key && payload.order_id);
    let invoiceId = payload.order_id || payload.invoiceId || payload.reference;
    let isPaid = false;
    let domainStatus = "PENDING";
    let rawStatus = (
      payload.transaction_status ||
      payload.status ||
      payload.payment_status ||
      ""
    ).toUpperCase();

    if (isMidtransPayload) {
      const parsed = parseMidtransNotification(payload);

      if (!parsed.isValid) {
        console.error("Midtrans Webhook: Invalid Signature Key for order", parsed.orderId);
        return NextResponse.json(
          { success: false, message: "Validasi signature Midtrans gagal." },
          { status: 403 }
        );
      }

      invoiceId = parsed.orderId;
      isPaid = parsed.isPaid;
      domainStatus = parsed.status;
      rawStatus = parsed.rawStatus.toUpperCase();
    } else {
      // Fallback untuk testing internal atau gateway alternatif
      if (isMidtransProduction()) {
        return NextResponse.json(
          { success: false, message: "Webhook tanpa signature ditolak pada mode production." },
          { status: 403 }
        );
      }

      isPaid =
        rawStatus === "PAID" ||
        rawStatus === "SETTLEMENT" ||
        rawStatus === "SUCCESS" ||
        rawStatus === "CAPTURE";
      domainStatus = isPaid ? "PAID" : rawStatus === "EXPIRE" ? "EXPIRED" : "PENDING";
    }

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Parameter invoiceId tidak ditemukan dalam payload webhook." },
        { status: 400 }
      );
    }

    // Eksekusi mutasi atomik
    const updated = await prisma.$transaction(async (tx) => {
      const donation = await tx.donation.findUnique({
        where: { invoiceId },
      });

      if (!donation) {
        return null;
      }

      // Idempotensi: jika sudah PAID, jangan lakukan mutasi penambahan lagi
      if (donation.status === "PAID") {
        return donation;
      }

      if (isPaid) {
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
      }

      if (domainStatus === "EXPIRED" || rawStatus === "EXPIRE") {
        return await tx.donation.update({
          where: { invoiceId },
          data: { status: "EXPIRED" },
        });
      }

      if (domainStatus === "CANCELLED" || rawStatus === "CANCEL" || rawStatus === "DENY") {
        return await tx.donation.update({
          where: { invoiceId },
          data: { status: "CANCELLED" },
        });
      }

      return donation;
    });

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Data donasi dengan nomor invoice tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invoice ${invoiceId} berhasil diproses (Status: ${updated.status}).`,
      data: {
        invoiceId: updated.invoiceId,
        status: updated.status,
        paidAt: updated.paidAt,
      },
    });
  } catch (error) {
    console.error("Payment webhook processing error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal pada pemrosesan webhook gateway." },
      { status: 500 }
    );
  }
}
