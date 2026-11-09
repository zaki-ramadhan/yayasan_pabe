import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { parseMidtransNotification, invalidateMidtransStatusCache } from "@/services/midtransService";
import { isMidtransProduction } from "@/lib/midtransConfig";
import { settleDonationStatus, buildAdminDonationEventPayload } from "@/services/donationService";
import { broadcastAdminEvent } from "@/lib/sseBroadcast";

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
      // Fallback hanya diizinkan untuk unit test otomatis internal
      const isTestEnv = process.env.NODE_ENV === "test" || process.env.VITEST;
      if (!isTestEnv) {
        return NextResponse.json(
          { success: false, message: "Webhook tanpa signature Midtrans resmi ditolak." },
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
    let updated = null;
    let previousStatus = null;

    if (isPaid) {
      const grossAmount = isMidtransPayload
        ? parsed.grossAmount
        : Number(payload.gross_amount || payload.amount || 0);

      updated = await settleDonationStatus(invoiceId, new Date(), {
        expectedAmount: grossAmount > 0 ? grossAmount : null,
      });
    } else {
      updated = await prisma.$transaction(async (tx) => {
        const donation = await tx.donation.findUnique({
          where: { invoiceId },
        });

        if (!donation) {
          return null;
        }

        previousStatus = donation.status;

        // Idempotensi: jika sudah PAID, jangan ubah ke EXPIRED atau CANCELLED
        if (donation.status === "PAID") {
          return donation;
        }

        if (domainStatus === "EXPIRED" || rawStatus === "EXPIRE") {
          return await tx.donation.update({
            where: { invoiceId },
            data: { status: "EXPIRED" },
            include: { campaign: { select: { id: true, title: true, slug: true } } },
          });
        }

        if (domainStatus === "CANCELLED" || rawStatus === "CANCEL" || rawStatus === "DENY") {
          return await tx.donation.update({
            where: { invoiceId },
            data: { status: "CANCELLED" },
            include: { campaign: { select: { id: true, title: true, slug: true } } },
          });
        }

        return donation;
      });
    }

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Data donasi dengan nomor invoice tersebut tidak ditemukan." },
        { status: 404 }
      );
    }

    invalidateMidtransStatusCache(invoiceId);

    if (!isPaid && (updated.status === "EXPIRED" || updated.status === "CANCELLED")) {
      try {
        broadcastAdminEvent(
          "DONATION_UPDATED",
          buildAdminDonationEventPayload(updated, { previousStatus })
        );
      } catch {}
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
