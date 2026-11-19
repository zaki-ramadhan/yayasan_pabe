import prisma from "@/lib/prisma";
import { maskEmail } from "@/lib/security";
import { resolveUserAvatar } from "@/lib/userParser";
import { settleDonationStatus } from "@/services/donationService";
import { buildDonationTypeWhere, isZisTransaction } from "@/lib/zisFilter";

/**
 * Mengambil daftar mutasi transaksi donasi masuk yang telah berhasil (PAID).
 */
export async function getAdminTransactions({
  search = "",
  paymentChannel = "",
  donationType = "",
  page = 1,
  limit = 10,
} = {}) {
  const skip = (Math.max(1, page) - 1) * limit;

  try {
    const andConditions = [{ status: "PAID" }];
    if (paymentChannel && paymentChannel !== "ALL") {
      andConditions.push({
        paymentChannel: { equals: paymentChannel, mode: "insensitive" },
      });
    }
    if (donationType && donationType !== "ALL") {
      const typeWhere = buildDonationTypeWhere(donationType);
      if (Object.keys(typeWhere).length > 0) {
        andConditions.push(typeWhere);
      }
    }
    if (search) {
      andConditions.push({
        OR: [
          { invoiceId: { contains: search, mode: "insensitive" } },
          { donorName: { contains: search, mode: "insensitive" } },
          { donorEmail: { contains: search, mode: "insensitive" } },
          { donorPhone: { contains: search } },
        ],
      });
    }

    const where = { AND: andConditions };

    const [total, items] = await Promise.all([
      prisma.donation.count({ where }),
      prisma.donation.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ paidAt: "desc" }, { createdAt: "desc" }],
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: { select: { slug: true, name: true } },
            },
          },
        },
      }),
    ]);

    const emails = Array.from(new Set(items.map((d) => d.donorEmail).filter(Boolean)));
    const phones = Array.from(new Set(items.map((d) => d.donorPhone).filter(Boolean)));

    const matchedUsers =
      emails.length > 0 || phones.length > 0
        ? await prisma.user.findMany({
            where: {
              OR: [
                ...(emails.length > 0 ? [{ email: { in: emails, mode: "insensitive" } }] : []),
                ...(phones.length > 0 ? [{ phone: { in: phones } }] : []),
              ],
            },
            select: {
              email: true,
              phone: true,
              avatar: true,
              customAvatar: true,
              providerAvatar: true,
            },
          })
        : [];

    const userAvatarMap = new Map();
    for (const u of matchedUsers) {
      const bestAvatar = resolveUserAvatar(u);
      if (u.email) userAvatarMap.set(`email:${u.email.toLowerCase()}`, bestAvatar);
      if (u.phone) userAvatarMap.set(`phone:${u.phone}`, bestAvatar);
    }

    return {
      items: items.map((d) => {
        const cleanEmail = d.donorEmail ? d.donorEmail.toLowerCase() : "";
        const userAvatar =
          (!d.isAnonymous &&
            ((cleanEmail && userAvatarMap.get(`email:${cleanEmail}`)) ||
              (d.donorPhone && userAvatarMap.get(`phone:${d.donorPhone}`)))) ||
          null;

        return {
          id: d.id,
          invoiceId: d.invoiceId,
          donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
          rawDonorName: d.donorName,
          donorEmail: d.donorEmail ? maskEmail(d.donorEmail) : "",
          donorPhone: d.donorPhone,
          donorAvatar: d.isAnonymous ? null : (userAvatar || d.donorAvatar || null),
          isAnonymous: Boolean(d.isAnonymous),
          amount: Number(d.amount),
          totalAmount: Number(d.totalAmount),
          paymentChannel: d.paymentChannel,
          status: d.status,
          donationType: d.donationType || "CAMPAIGN",
          campaignTitle:
            d.campaign?.title ||
            (d.donationType === "ZAKAT"
              ? "Zakat Maal & Fitrah"
              : d.donationType === "INFAK_SUBUH"
              ? "Sedekah Subuh"
              : "Donasi Umum"),
          campaignSlug: d.campaign?.slug || "",
          categorySlug: d.campaign?.category?.slug || "",
          categoryName: d.campaign?.category?.name || "",
          isZis: isZisTransaction(d),
          createdAt: d.createdAt.toISOString(),
          paidAt: d.paidAt ? d.paidAt.toISOString() : null,
        };
      }),
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
      error: error.message || "Gagal memuat riwayat transaksi.",
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
