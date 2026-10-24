import prisma from "@/lib/prisma";
import { RECENT_TRANSACTIONS } from "@/data/adminMockData";
import { maskEmail } from "@/lib/security";

/**
 * Mengambil daftar mutasi transaksi donasi dengan filter kanal dan status.
 */
export async function getAdminTransactions({
  search = "",
  status = "",
  paymentChannel = "",
  page = 1,
  limit = 10,
} = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const where = {};
    if (status && status !== "ALL") where.status = status;
    if (paymentChannel && paymentChannel !== "ALL") where.paymentChannel = paymentChannel;
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
        orderBy: { createdAt: "desc" },
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
    console.warn("Prisma getAdminTransactions fallback:", error.message);
    const mock = RECENT_TRANSACTIONS.map((t, idx) => ({
      id: `mock-${idx + 1}`,
      invoiceId: t.id,
      donorName: t.donor,
      rawDonorName: t.donor,
      donorEmail: maskEmail(`${t.donor.toLowerCase().replace(/[^a-z0-9]/g, ".")}@gmail.com`),
      donorPhone: "08123456789",
      donorAvatar: null,
      isAnonymous: t.donor === "Hamba Allah",
      amount: t.amount,
      totalAmount: t.amount,
      paymentChannel: t.channel,
      status: t.status === "Sukses" ? "PAID" : "PENDING",
      campaignTitle: t.campaign,
      campaignSlug: "beasiswa-santri",
      createdAt: t.time ? new Date().toISOString() : new Date().toISOString(),
      paidAt: t.status === "Sukses" ? new Date().toISOString() : null,
    }));

    return {
      items: mock.slice(skip, skip + limit),
      pagination: {
        page,
        limit,
        total: mock.length,
        totalPages: Math.ceil(mock.length / limit) || 1,
      },
    };
  }
}

/**
 * Verifikasi transaksi secara atomik (ACID): update status PAID dan increment dana campaign.
 */
export async function verifyAdminTransaction(donationId) {
  return prisma.$transaction(async (tx) => {
    const donation = await tx.donation.findUnique({
      where: { id: donationId },
      include: { campaign: true },
    });

    if (!donation) {
      throw new Error("Transaksi donasi tidak ditemukan.");
    }

    if (donation.status === "PAID") {
      return donation;
    }

    const updatedDonation = await tx.donation.update({
      where: { id: donationId },
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

    return updatedDonation;
  });
}
