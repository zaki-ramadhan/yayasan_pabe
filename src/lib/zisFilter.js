/**
 * SSOT helper untuk memisahkan dan mengklasifikasikan transaksi & program ZIS
 * (Zakat, Infaq, Sedekah) dari program donasi umum.
 */

export const TRANSACTION_TABS = {
  ALL: "ALL",
  CAMPAIGN: "CAMPAIGN",
  ZIS: "ZIS",
};

/**
 * Kondisi Prisma `where` untuk mencocokkan Campaign berkategori ZIS / Zakat.
 */
export const ZIS_CAMPAIGN_WHERE = {
  OR: [
    { slug: { contains: "zakat", mode: "insensitive" } },
    { slug: { contains: "zis", mode: "insensitive" } },
    { categoryId: "zakat" },
    { category: { slug: "zakat" } },
    { category: { slug: "zis" } },
    { category: { name: { contains: "zakat", mode: "insensitive" } } },
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
 * Predikat runtime JS untuk mengecek apakah suatu transaksi/item termasuk kategori ZIS.
 */
export function isZisTransaction(tx) {
  if (!tx) return false;
  if (tx.isZis === true) return true;

  const type = String(tx.donationType || "").toUpperCase();
  if (type === "ZAKAT" || type === "INFAK_SUBUH") return true;

  const slug = String(tx.campaignSlug || tx.campaign?.slug || "").toLowerCase();
  const catSlug = String(tx.categorySlug || tx.campaign?.category?.slug || "").toLowerCase();
  const catName = String(tx.categoryName || tx.campaign?.category?.name || "").toLowerCase();

  return (
    slug.includes("zakat") ||
    slug.includes("zis") ||
    catSlug === "zakat" ||
    catSlug === "zis" ||
    catName.includes("zakat") ||
    catName.includes("zis")
  );
}

/**
 * Menentukan label singkat badge untuk baris tabel transaksi.
 */
export function getTransactionTypeLabel(tx) {
  if (!tx) return "Donasi Program";
  const type = String(tx.donationType || "").toUpperCase();
  if (type === "ZAKAT") return "Zakat";
  if (type === "INFAK_SUBUH") return "Sedekah Subuh";
  if (isZisTransaction(tx)) return "Program ZIS";
  if (tx.routineDonationId || tx.isRoutine) return "Donasi Rutin";
  return "Donasi Program";
}

