/**
 * SSOT helper untuk memisahkan dan mengklasifikasikan kategori, program,
 * dan transaksi ZIS (Zakat, Infaq, Sedekah) dari program donasi umum.
 */

export const TRANSACTION_TABS = {
  ALL: "ALL",
  CAMPAIGN: "CAMPAIGN",
  ZIS: "ZIS",
};

/**
 * 3 Kategori mutlak untuk modul ZIS (terkunci sistem, tidak dapat diubah/dihapus).
 */
export const ZIS_LOCKED_CATEGORIES = [
  { id: "zakat", name: "Zakat", slug: "zakat", iconName: "Coins" },
  { id: "infaq", name: "Infaq", slug: "infaq", iconName: "HeartHandshake" },
  { id: "sedekah", name: "Sedekah", slug: "sedekah", iconName: "HandHeart" },
];

export const ZIS_LOCKED_CATEGORY_IDS = ZIS_LOCKED_CATEGORIES.map((c) => c.id);
export const ZIS_CATEGORY_SLUGS = ["zakat", "infaq", "sedekah", "zis"];

/**
 * Kondisi Prisma `where` untuk mencocokkan Campaign berkategori ZIS (Zakat, Infaq, Sedekah).
 */
export const ZIS_CAMPAIGN_WHERE = {
  OR: [
    { slug: { contains: "zakat", mode: "insensitive" } },
    { slug: { contains: "zis", mode: "insensitive" } },
    { categoryId: { in: ZIS_CATEGORY_SLUGS } },
    { category: { slug: { in: ZIS_CATEGORY_SLUGS } } },
    { category: { name: { contains: "zakat", mode: "insensitive" } } },
    { category: { name: { contains: "infaq", mode: "insensitive" } } },
    { category: { name: { contains: "sedekah", mode: "insensitive" } } },
    { category: { name: { contains: "zis", mode: "insensitive" } } },
  ],
};

/**
 * Kondisi Prisma `where` untuk mencocokkan Donation yang termasuk dana ZIS.
 */
export const ZIS_DONATION_WHERE = {
  OR: [
    { donationType: { in: ["ZAKAT", "INFAK_SUBUH"] } },
    { campaign: ZIS_CAMPAIGN_WHERE },
  ],
};

/**
 * Membangun klausa Prisma `where` untuk filter kategori transaksi (`ALL` | `CAMPAIGN` | `ZIS` | `ZAKAT`).
 * Aman terhadap relasi `campaign` bernilai `null`.
 */
export function buildDonationTypeWhere(type) {
  const normalized = String(type || "ALL").toUpperCase();

  if (normalized === "ZIS" || normalized === "ZAKAT") {
    return ZIS_DONATION_WHERE;
  }

  if (normalized === "CAMPAIGN") {
    return {
      AND: [
        { donationType: { notIn: ["ZAKAT", "INFAK_SUBUH"] } },
        {
          OR: [
            { campaignId: null },
            { campaign: { NOT: ZIS_CAMPAIGN_WHERE } },
          ],
        },
      ],
    };
  }

  if (normalized !== "ALL") {
    return { donationType: { equals: normalized, mode: "insensitive" } };
  }

  return {};
}

/**
 * Predikat untuk mengecek apakah suatu entitas Category termasuk kategori ZIS (Zakat, Infaq, Sedekah).
 */
export function isZisCategory(cat) {
  if (!cat) return false;
  const id = String(cat.id || "").toLowerCase();
  const slug = String(cat.slug || "").toLowerCase();
  const name = String(cat.name || "").toLowerCase();

  return (
    ZIS_CATEGORY_SLUGS.includes(id) ||
    ZIS_CATEGORY_SLUGS.includes(slug) ||
    name.includes("zakat") ||
    name.includes("infaq") ||
    name.includes("sedekah") ||
    name.includes("zis")
  );
}

/**
 * Predikat apakah sebuah ID / slug termasuk 3 kategori mutlak ZIS yang terkunci sistem.
 */
export function isLockedZisCategoryId(idOrSlug) {
  if (!idOrSlug) return false;
  return ZIS_LOCKED_CATEGORY_IDS.includes(String(idOrSlug).toLowerCase());
}

/**
 * Predikat runtime JS untuk mengecek apakah suatu program/campaign termasuk kategori ZIS.
 */
export function isZisCampaign(campaign) {
  if (!campaign) return false;
  const slug = String(campaign.slug || campaign.campaignSlug || "").toLowerCase();
  const catId = String(campaign.categoryId || "").toLowerCase();
  const catSlug = String(campaign.categorySlug || campaign.category?.slug || "").toLowerCase();
  const catName = String(
    typeof campaign.category === "string"
      ? campaign.category
      : campaign.category?.name || campaign.categoryName || ""
  ).toLowerCase();

  return (
    slug.includes("zakat") ||
    slug.includes("zis") ||
    ZIS_CATEGORY_SLUGS.includes(catId) ||
    ZIS_CATEGORY_SLUGS.includes(catSlug) ||
    catName.includes("zakat") ||
    catName.includes("infaq") ||
    catName.includes("sedekah") ||
    catName.includes("zis")
  );
}

/**
 * Predikat runtime JS untuk mengecek apakah suatu transaksi/item termasuk kategori ZIS.
 */
export function isZisTransaction(tx) {
  if (!tx) return false;
  if (tx.isZis === true) return true;

  const type = String(tx.donationType || "").toUpperCase();
  if (type === "ZAKAT" || type === "INFAK_SUBUH") return true;

  return isZisCampaign(tx) || Boolean(tx.campaign && isZisCampaign(tx.campaign));
}

/**
 * Menentukan label singkat badge untuk baris tabel transaksi.
 */
export function getTransactionTypeLabel(tx) {
  if (!tx) return "Donasi Program";
  const type = String(tx.donationType || "").toUpperCase();
  const catSlug = String(tx.categorySlug || tx.campaign?.category?.slug || "").toLowerCase();
  const catName = String(tx.categoryName || tx.campaign?.category?.name || "").toLowerCase();

  if (type === "ZAKAT" || catSlug === "zakat" || catName === "zakat") return "Zakat";
  if (type === "INFAK_SUBUH") return "Sedekah Subuh";
  if (catSlug === "infaq" || catName === "infaq") return "Infaq";
  if (catSlug === "sedekah" || catName === "sedekah") return "Sedekah";
  if (isZisTransaction(tx)) return "Program ZIS";
  if (tx.routineDonationId || tx.isRoutine) return "Donasi Rutin";
  return "Donasi Program";
}

/**
 * Mengembalikan URL halaman detail program kanonikal (`/zis/[slug]` atau `/program/[slug]`).
 */
export function getCampaignDetailHref(campaignOrSlug) {
  if (!campaignOrSlug) return "/program";
  if (typeof campaignOrSlug === "string") {
    const slug = campaignOrSlug.trim();
    if (!slug) return "/program";
    return isZisCampaign({ slug }) ? `/zis/${slug}` : `/program/${slug}`;
  }
  const slug = campaignOrSlug.slug || campaignOrSlug.campaignSlug || "";
  if (!slug) {
    return isZisCampaign(campaignOrSlug) ? "/zis" : "/program";
  }
  return isZisCampaign(campaignOrSlug) ? `/zis/${slug}` : `/program/${slug}`;
}

/**
 * Mengembalikan URL halaman checkout/donasi program kanonikal (`/zis/[slug]/donasi` atau `/program/[slug]/donasi`).
 */
export function getCampaignDonateHref(campaignOrSlug) {
  const baseHref = getCampaignDetailHref(campaignOrSlug);
  if (baseHref === "/program" || baseHref === "/zis") {
    return baseHref;
  }
  return `${baseHref}/donasi`;
}
