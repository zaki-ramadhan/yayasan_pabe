import {
  ALL_BENEFICIARIES,
  BENEFICIARY_CATEGORIES,
} from "@/data/beneficiaries";

/**
 * Service Layer: Mengelola data penerima manfaat binaan Yayasan Payung Berkah
 */

export async function getBeneficiaryStats() {
  const total = ALL_BENEFICIARIES.length;
  const yatimCount = ALL_BENEFICIARIES.filter(
    (b) => b.category === BENEFICIARY_CATEGORIES.YATIM
  ).length;
  const lansiaDhuafaCount = ALL_BENEFICIARIES.filter(
    (b) => b.category === BENEFICIARY_CATEGORIES.LANSIA_DHUAFA
  ).length;
  const maleCount = ALL_BENEFICIARIES.filter((b) => b.gender === "L").length;
  const femaleCount = ALL_BENEFICIARIES.filter((b) => b.gender === "P").length;

  return {
    total,
    yatimCount,
    lansiaDhuafaCount,
    maleCount,
    femaleCount,
    verifiedStatus: "Terdaftar Resmi LKS Cakung 2026",
  };
}

export async function getBeneficiaries({
  category = BENEFICIARY_CATEGORIES.ALL,
  gender = "ALL",
  searchQuery = "",
  page = 1,
  pageSize = 10,
} = {}) {
  let list = [...ALL_BENEFICIARIES];

  // Filter Kategori
  if (category && category !== BENEFICIARY_CATEGORIES.ALL) {
    list = list.filter((item) => item.category === category);
  }

  // Filter Gender
  if (gender && gender !== "ALL") {
    list = list.filter((item) => item.gender === gender);
  }

  // Search Query (Sanitasi & Auto-trim)
  const query = (searchQuery || "").trim().toLowerCase();
  if (query) {
    list = list.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.program.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
    );
  }

  const totalItems = list.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const items = list.slice(startIndex, startIndex + pageSize);

  return {
    items,
    pagination: {
      currentPage: safePage,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}
