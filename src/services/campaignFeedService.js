import prisma from "@/lib/prisma";
import { CAMPAIGNS } from "@/data/campaigns";
import { maskEmail } from "@/lib/security";

/**
 * Mengambil daftar donatur kampanye terpaginasi untuk feed donatur publik
 */
export async function getCampaignDonationsPaginated({ campaignSlug, skip = 0, limit = 20 }) {
  if (!campaignSlug) return { donations: [], totalCount: 0, hasMore: false };

  try {
    const campaign = await prisma.campaign.findUnique({
      where: { slug: campaignSlug },
      select: { id: true, donorCount: true },
    });

    if (!campaign) {
      return { donations: [], totalCount: 0, hasMore: false };
    }

    const [dbDonations, totalCount] = await Promise.all([
      prisma.donation.findMany({
        where: {
          campaignId: campaign.id,
          status: "PAID",
        },
        orderBy: { paidAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          donorName: true,
          donorEmail: true,
          donorAvatar: true,
          isAnonymous: true,
          amount: true,
          paidAt: true,
          createdAt: true,
          prayer: true,
          isPrayerHidden: true,
          isPrayerPinned: true,
          prayerReply: true,
          prayerReplyAt: true,
        },
      }),
      prisma.donation.count({
        where: {
          campaignId: campaign.id,
          status: "PAID",
        },
      }),
    ]);

    const formattedDonations = dbDonations.map((d) => {
      const isAnon = Boolean(d.isAnonymous);
      const rawEmail = isAnon
        ? "hamba.allah***@gmail.com"
        : (d.donorEmail || (d.donorName ? `${d.donorName.toLowerCase().replace(/[^a-z0-9]/g, ".")}@gmail.com` : "donatur@pabe.id"));

      return {
        id: d.id,
        name: isAnon ? "Hamba Allah" : d.donorName,
        amount: Number(d.amount || 0),
        email: maskEmail(rawEmail),
        avatar: isAnon ? null : (d.donorAvatar || null),
        date: d.paidAt
          ? (d.paidAt instanceof Date ? d.paidAt.toISOString() : d.paidAt)
          : (d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt),
        prayer: d.isPrayerHidden ? "" : (d.prayer || ""),
        isPrayerPinned: Boolean(d.isPrayerPinned),
        prayerReply: d.isPrayerHidden ? null : (d.prayerReply || null),
        prayerReplyAt: d.prayerReplyAt ? (d.prayerReplyAt instanceof Date ? d.prayerReplyAt.toISOString() : d.prayerReplyAt) : null,
        aminCount: 0,
        isAnonymous: isAnon,
      };
    });

    return {
      donations: formattedDonations,
      totalCount,
      hasMore: skip + formattedDonations.length < totalCount,
    };
  } catch (error) {
    console.warn("Prisma getCampaignDonationsPaginated fallback:", error.message);
    return { donations: [], totalCount: 0, hasMore: false };
  }
}

/**
 * Mengambil daftar berita dan kabar terbaru (updates) seluruh kampanye
 */
export async function getCampaignUpdates() {
  try {
    const updates = await prisma.campaignUpdate.findMany({
      orderBy: { date: "desc" },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            slug: true,
            bannerUrl: true,
          },
        },
      },
    });
    if (updates && updates.length > 0) {
      return updates.map((u) => {
        const seedCampaign = CAMPAIGNS.find((sc) => sc.id === u.campaignId || sc.slug === u.campaign?.slug);
        const seedUpdate = (seedCampaign?.updates || []).find((su) => su.id === u.id || su.title === u.title);
        const resolvedImages =
          Array.isArray(u.images) && u.images.length > 0
            ? u.images
            : seedUpdate?.images && seedUpdate.images.length > 0
            ? seedUpdate.images
            : u.image
            ? [u.image]
            : seedUpdate?.image
            ? [seedUpdate.image]
            : [];

        return {
          id: u.id,
          title: u.title,
          content: u.content,
          date: u.date instanceof Date ? u.date.toISOString().split("T")[0] : u.date,
          images: resolvedImages,
          imageCaptions: u.imageCaptions || [],
          spentAmount: u.spentAmount || 0,
          beneficiaryCount: u.beneficiaryCount || 0,
          location: u.location || "Wilayah Binaan PABE",
          spentBreakdown: u.spentBreakdown || [],
          campaign: u.campaign,
        };
      });
    }
  } catch (error) {
    console.warn("Prisma getCampaignUpdates fallback:", error.message);
  }
  return [];
}
