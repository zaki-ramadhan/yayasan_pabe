import prisma from "@/lib/prisma";
import { maskEmail } from "@/lib/security";
import { settleDonationStatus } from "@/services/donationService";

/**
 * Mengambil daftar mutasi transaksi donasi masuk yang telah berhasil (PAID).
 */
export async function getAdminTransactions({
  search = "",
  paymentChannel = "",
  page = 1,
  limit = 10,
} = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const where = { status: "PAID" };
    if (paymentChannel && paymentChannel !== "ALL") {
      where.paymentChannel = { equals: paymentChannel, mode: "insensitive" };
    }
    if (search) {
      where.OR = [
        { invoiceId: { contains: search, mode: "insensitive" } },
        { donorName: { contains: search, mode: "insensitive" } },
        { donorEmail: { contains: search, mode: "insensitive" } },
        { donorPhone: { contains: search } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
        include: {
          campaign: { select: { id: true, title: true, slug: true } },
        },
      }),
    ]);

    return {
      items: items.map((d) => ({
        id: d.id,
        invoiceId: d.invoiceId,
        donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
        rawDonorName: d.donorName,
        donorEmail: d.donorEmail ? maskEmail(d.donorEmail) : "",
        donorPhone: d.donorPhone,
        donorAvatar: d.donorAvatar || null,
        isAnonymous: Boolean(d.isAnonymous),
        amount: Number(d.amount),
        totalAmount: Number(d.totalAmount),
        paymentChannel: d.paymentChannel,
        status: d.status,
        campaignTitle: d.campaign?.title || "Donasi Umum",
        campaignSlug: d.campaign?.slug || "",
        createdAt: d.createdAt.toISOString(),
        paidAt: d.paidAt ? d.paidAt.toISOString() : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  } catch (error) {
    console.warn("Prisma getAdminTransactions error:", error.message);
    return {
      items: [],
      error: error.message || "Gagal memuat data transaksi dari database.",
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 1,
      },
    };
  }
}


/**
 * Verifikasi transaksi manual admin secara atomik:
 * Memanfaatkan SSOT settleDonationStatus untuk menjamin pelunasan status PAID,
 * increment collectedAmount campaign, broadcast SSE, dan penerbitan e-Kwitansi resmi.
 */
export async function verifyAdminTransaction(donationId) {
  if (!donationId) {
    throw new Error("ID transaksi donasi tidak valid.");
  }

  const donation = await prisma.donation.findFirst({
    where: {
      OR: [
        { id: donationId },
        { invoiceId: donationId },
      ],
    },
    select: { id: true, invoiceId: true, status: true },
  });

  if (!donation) {
    throw new Error("Transaksi donasi tidak ditemukan.");
  }

  if (donation.status === "PAID") {
    return donation;
  }

  return await settleDonationStatus(donation.invoiceId, new Date());
}
