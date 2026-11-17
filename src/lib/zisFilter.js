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
      NOT: ZIS_DONATION_WHERE,
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

/**
 * SSOT Helper kosakata peribadatan dan filantropi Islam (Zakat, Infaq, Sedekah, Wakaf, Donasi).
 * Menyesuaikan istilah subjek email, sapaan peran (Muzakki/Munfiq/Wakif/Donatur), rincian tagihan,
 * tombol aksi, dan doa penerima agar sesuai syariat dan tidak merujuk "donasi" untuk seluruh transaksi.
 *
 * @param {object} txOrParams - Transaksi, donasi, atau objek parameter konteks
 * @returns {object} Kamus kosakata kontekstual
 */
export function getTransactionVocabulary(txOrParams = {}) {
  const donationType =
    txOrParams.donationType ||
    txOrParams.type ||
    "";
  const categorySlug =
    txOrParams.categorySlug ||
    txOrParams.category?.slug ||
    txOrParams.campaign?.category?.slug ||
    txOrParams.campaign?.categorySlug ||
    "";
  const categoryName =
    txOrParams.categoryName ||
    (typeof txOrParams.category === "string" ? txOrParams.category : txOrParams.category?.name) ||
    txOrParams.campaign?.category?.name ||
    txOrParams.campaign?.categoryName ||
    "";
  const programTitle =
    txOrParams.programTitle ||
    txOrParams.campaignTitle ||
    txOrParams.campaign?.title ||
    txOrParams.title ||
    "";

  const normType = String(donationType).toUpperCase().trim();
  const normCatSlug = String(categorySlug).toLowerCase().trim();
  const normCatName = String(categoryName).toLowerCase().trim();
  const normTitle = String(programTitle).toLowerCase().trim();

  const isZakat =
    normType === "ZAKAT" ||
    normCatSlug === "zakat" ||
    normCatName.includes("zakat") ||
    normTitle.includes("zakat");

  if (isZakat) {
    return {
      kind: "ZAKAT",
      noun: "zakat",
      capitalizedNoun: "Zakat",
      actionVerb: "menunaikan zakat",
      billLabel: "Tagihan Zakat",
      totalPaidLabel: "Total Zakat Terbayar",
      detailsLabel: "Rincian Zakat",
      coreAmountLabel: "Zakat Pokok",
      channelLabel: "Saluran Zakat",
      subjectPrefix: "Bukti Pembayaran Zakat Sah",
      heading: "Pembayaran Zakat Berhasil",
      partyLabel: "Nama Muzakki",
      programLabel: "Program Zakat",
      nominalLabel: "Nominal Zakat",
      buttonText: "Buka Bukti Setor Zakat",
      archiveLabel: "arsip zakat",
      statusBannerPaid:
        "Alhamdulillah, amanah zakat Anda telah kami terima secara resmi melalui sistem perbankan.",
      openingText:
        "Alhamdulillah, zakat yang Anda tunaikan telah kami terima dengan rincian transaksi sebagai berikut:",
      closingDoa:
        "Jazakumullah khairan katsiran atas zakat yang Anda tunaikan. Semoga Allah SWT memberikan pahala atas apa yang telah Anda keluarkan, melimpahkan keberkahan atas harta yang masih tersimpan, serta menjadikannya penyuci lahir dan batin bagi Anda sekeluarga. Aamiin ya Rabbal 'Alamin.",
    };
  }

  const isWakaf =
    normType === "WAKAF" ||
    normCatSlug === "wakaf" ||
    normCatName.includes("wakaf") ||
    normTitle.includes("wakaf");

  if (isWakaf) {
    return {
      kind: "WAKAF",
      noun: "wakaf",
      capitalizedNoun: "Wakaf",
      actionVerb: "menunaikan wakaf",
      billLabel: "Tagihan Wakaf",
      totalPaidLabel: "Total Wakaf Terbayar",
      detailsLabel: "Rincian Wakaf",
      coreAmountLabel: "Wakaf Pokok",
      channelLabel: "Saluran Wakaf",
      subjectPrefix: "Bukti Wakaf Sah",
      heading: "Pembayaran Wakaf Berhasil",
      partyLabel: "Nama Wakif",
      programLabel: "Program Wakaf",
      nominalLabel: "Nominal Wakaf",
      buttonText: "Buka Bukti Wakaf Digital",
      archiveLabel: "arsip wakaf",
      statusBannerPaid:
        "Alhamdulillah, amanah wakaf Anda telah kami terima secara resmi melalui sistem perbankan.",
      openingText:
        "Alhamdulillah, amanah wakaf yang Anda tunaikan telah kami terima dengan rincian transaksi sebagai berikut:",
      closingDoa:
        "Jazakumullah khairan katsiran atas wakaf yang Anda tunaikan. Semoga Allah SWT menerima amal jariyah ini, melipatgandakan pahala yang senantiasa mengalir tanpa putus, serta senantiasa memberkahi Anda sekeluarga. Aamiin ya Rabbal 'Alamin.",
    };
  }

  const isInfaq =
    normType === "INFAQ" ||
    normCatSlug === "infaq" ||
    normCatName.includes("infaq") ||
    normTitle.includes("infaq") ||
    normTitle.includes("infak");

  if (isInfaq) {
    return {
      kind: "INFAQ",
      noun: "infaq",
      capitalizedNoun: "Infaq",
      actionVerb: "berinfaq",
      billLabel: "Tagihan Infaq",
      totalPaidLabel: "Total Infaq Terbayar",
      detailsLabel: "Rincian Infaq",
      coreAmountLabel: "Infaq Pokok",
      channelLabel: "Saluran Infaq",
      subjectPrefix: "Bukti Infaq Sah",
      heading: "Pembayaran Infaq Berhasil",
      partyLabel: "Nama Munfiq",
      programLabel: "Program Infaq",
      nominalLabel: "Nominal Infaq",
      buttonText: "Buka Bukti Infaq Digital",
      archiveLabel: "arsip infaq",
      statusBannerPaid:
        "Alhamdulillah, amanah infaq Anda telah kami terima secara resmi melalui sistem perbankan.",
      openingText:
        "Alhamdulillah, infaq yang Anda tunaikan telah kami terima dengan rincian transaksi sebagai berikut:",
      closingDoa:
        "Jazakumullah khairan katsiran atas infaq yang Anda tunaikan. Semoga Allah SWT menerima amal ibadah ini, melipatgandakan rezeki, serta senantiasa memberkahi Anda sekeluarga. Aamiin ya Rabbal 'Alamin.",
    };
  }

  const isSedekah =
    normType === "SEDEKAH" ||
    normType === "INFAK_SUBUH" ||
    normCatSlug === "sedekah" ||
    normCatName.includes("sedekah") ||
    normTitle.includes("sedekah");

  if (isSedekah) {
    return {
      kind: "SEDEKAH",
      noun: "sedekah",
      capitalizedNoun: "Sedekah",
      actionVerb: "bersedekah",
      billLabel: "Tagihan Sedekah",
      totalPaidLabel: "Total Sedekah Terbayar",
      detailsLabel: "Rincian Sedekah",
      coreAmountLabel: "Sedekah Pokok",
      channelLabel: "Saluran Sedekah",
      subjectPrefix: "Bukti Sedekah Sah",
      heading: "Pembayaran Sedekah Berhasil",
      partyLabel: "Nama Pembayar",
      programLabel: "Program Sedekah",
      nominalLabel: "Nominal Sedekah",
      buttonText: "Buka Bukti Sedekah Digital",
      archiveLabel: "arsip sedekah",
      statusBannerPaid:
        "Alhamdulillah, amanah sedekah Anda telah kami terima secara resmi melalui sistem perbankan.",
      openingText:
        "Alhamdulillah, sedekah yang Anda tunaikan telah kami terima dengan rincian transaksi sebagai berikut:",
      closingDoa:
        "Jazakumullah khairan katsiran atas sedekah Anda. Semoga Allah SWT menerima amal ibadah ini, melipatgandakan rezeki, serta senantiasa memberkahi Anda sekeluarga. Aamiin ya Rabbal 'Alamin.",
    };
  }

  return {
    kind: "DONASI",
    noun: "donasi",
    capitalizedNoun: "Donasi",
    actionVerb: "berdonasi",
    billLabel: "Tagihan Donasi",
    totalPaidLabel: "Total Donasi Terbayar",
    detailsLabel: "Rincian Donasi",
    coreAmountLabel: "Donasi Pokok",
    channelLabel: "Saluran Donasi",
    subjectPrefix: "Bukti Donasi Sah",
    heading: "Pembayaran Berhasil",
    partyLabel: "Nama Donatur",
    programLabel: "Program Donasi",
    nominalLabel: "Nominal Donasi",
    buttonText: "Buka Bukti Donasi Digital",
    archiveLabel: "arsip donasi",
    statusBannerPaid:
      "Alhamdulillah, amanah donasi Anda telah kami terima secara resmi melalui sistem perbankan.",
    openingText:
      "Alhamdulillah, donasi yang Anda tunaikan telah kami terima dengan rincian transaksi sebagai berikut:",
    closingDoa:
      "Jazakumullah khairan katsiran atas donasi yang Anda tunaikan. Semoga Allah SWT menerima amal kebaikan ini, melipatgandakan rezeki, serta senantiasa memberkahi Anda sekeluarga. Aamiin ya Rabbal 'Alamin.",
  };
}

/**
 * Menghasilkan teks share WhatsApp resmi untuk invoice transaksi dengan tautan program & ajakan kebaikan.
 * @param {object} donation
 * @param {string} [origin=""]
 * @returns {string}
 */
export function buildDonationShareText(donation = {}, origin = "") {
  const vocab = getTransactionVocabulary({
    donationType: donation.donationType,
    categorySlug: donation.categorySlug || donation.campaign?.category?.slug || donation.campaign?.categorySlug,
    categoryName: donation.categoryName || donation.campaign?.category?.name || donation.campaign?.categoryName,
    campaignTitle: donation.campaignTitle || donation.campaign?.title,
  });

  const slug = donation.campaignSlug || donation.campaign?.slug;
  const isZis = vocab.kind !== "DONASI";
  const path = slug ? (isZis ? `/zis/${slug}` : `/program/${slug}`) : "/program";
  const baseUrl = origin ? origin.replace(/\/+$/, "") : "";
  const fullUrl = baseUrl ? `${baseUrl}${path}` : path;
  const campaignTitle = donation.campaignTitle || donation.campaign?.title || "Program Kebaikan";

  return `Alhamdulillah, saya telah ${vocab.actionVerb} untuk "${campaignTitle}" melalui Yayasan Payung Berkah.\n\nMari bersama alirkan kebaikan dan dukung saudara kita yang membutuhkan melalui tautan resmi berikut:\n${fullUrl}`;
}
