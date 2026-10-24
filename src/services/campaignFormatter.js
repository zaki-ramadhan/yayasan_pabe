import { CAMPAIGNS } from "@/data/campaigns";
import { maskEmail } from "@/lib/security";

/**
 * Normalisasi data kampanye dari Prisma ke format domain kampanye
 */
export function formatCampaignFromDb(c) {
  if (!c) return null;
  const paidDonations = (c.donations || []).map((d) => {
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
        ? d.paidAt instanceof Date
          ? d.paidAt.toISOString()
          : d.paidAt
        : d.createdAt instanceof Date
        ? d.createdAt.toISOString()
        : d.createdAt,
      prayer: d.prayer || "",
      aminCount: Number(d.aminCount || 0),
      isAnonymous: isAnon,
    };
  });

  return {
    ...c,
    collectedAmount: Number(c.collectedAmount || 0),
    donorCount: Number(c.donorCount || 0),
    endDate: c.endDate instanceof Date ? c.endDate.toISOString() : c.endDate,
    createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
    updatedAt: c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt,
    categoryName: c.category?.name || "Program Umum",
    categorySlug: c.category?.slug || "",
    updates: (c.updates || []).map((u) => {
      const seedCampaign = CAMPAIGNS.find((sc) => sc.id === c.id || sc.slug === c.slug);
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
        ...u,
        date: u.date instanceof Date ? u.date.toISOString().split("T")[0] : u.date,
        images: resolvedImages,
      };
    }),
    recentDonors: paidDonations,
  };
}
