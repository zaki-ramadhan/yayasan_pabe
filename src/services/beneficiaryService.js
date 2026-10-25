import prisma from "@/lib/prisma";
import {
  BENEFICIARY_CATEGORIES,
  ALL_BENEFICIARIES,
  YATIM_BENEFICIARIES,
  DHUAFA_LANSIA_BENEFICIARIES,
} from "@/data/beneficiaries";

export { BENEFICIARY_CATEGORIES };

/**
 * Service Layer: Mengelola data penerima manfaat binaan langsung dari PostgreSQL
 * dengan fallback ke data legal resmi yayasan.
 */
export async function getAllBeneficiaries() {
  try {
    if (prisma?.beneficiary) {
      const dbItems = await prisma.beneficiary.findMany({
        orderBy: { code: "asc" },
      });
      if (dbItems && dbItems.length > 0) {
        return dbItems.map((b) => ({
          id: b.code,
          name: b.name,
          gender: b.gender,
          category: b.category,
          categoryLabel: b.category === "YATIM" ? "Yatim Piatu" : "Dhu'afa / Lansia",
          program: b.program,
          location: b.location,
        }));
      }
    }
  } catch (err) {
    console.error("Prisma getAllBeneficiaries error:", err);
  }
  return ALL_BENEFICIARIES;
}

/**
 * Service Layer: Mengelola statistik penerima manfaat binaan langsung dari PostgreSQL
 * dengan fallback ke data legal resmi yayasan.
 */
export async function getBeneficiaryStats() {
  try {
    if (prisma?.beneficiary) {
      const [total, yatimCount, lansiaDhuafaCount, maleCount, femaleCount] = await Promise.all([
        prisma.beneficiary.count(),
        prisma.beneficiary.count({ where: { category: BENEFICIARY_CATEGORIES.YATIM } }),
        prisma.beneficiary.count({ where: { category: BENEFICIARY_CATEGORIES.LANSIA_DHUAFA } }),
        prisma.beneficiary.count({ where: { gender: "L" } }),
        prisma.beneficiary.count({ where: { gender: "P" } }),
      ]);

      if (total > 0) {
        return {
          total,
          yatimCount,
          lansiaDhuafaCount,
          maleCount,
          femaleCount,
          verifiedStatus: "Terdaftar Resmi LKS Cakung 2026",
        };
      }
    }
  } catch (err) {
    console.error("Prisma getBeneficiaryStats error:", err);
  }

  return {
    total: ALL_BENEFICIARIES.length,
    yatimCount: YATIM_BENEFICIARIES.length,
    lansiaDhuafaCount: DHUAFA_LANSIA_BENEFICIARIES.length,
    maleCount: ALL_BENEFICIARIES.filter((b) => b.gender === "L").length,
    femaleCount: ALL_BENEFICIARIES.filter((b) => b.gender === "P").length,
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
  try {
    const where = {};
    if (category && category !== BENEFICIARY_CATEGORIES.ALL) {
      where.category = category;
    }
    if (gender && gender !== "ALL") {
      where.gender = gender;
    }
    const query = (searchQuery || "").trim();
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { program: { contains: query, mode: "insensitive" } },
        { location: { contains: query, mode: "insensitive" } },
        { code: { contains: query, mode: "insensitive" } },
      ];
    }

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.max(1, parseInt(pageSize, 10) || 10);
    const skip = (safePage - 1) * safeLimit;

    const [totalItems, dbItems] = await Promise.all([
      prisma.beneficiary.count({ where }),
      prisma.beneficiary.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: { code: "asc" },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / safeLimit) || 1;
    return {
      items: dbItems.map((b) => ({
        id: b.code,
        name: b.name,
        gender: b.gender,
        category: b.category,
        categoryLabel: b.category === "YATIM" ? "Yatim Piatu" : "Dhu'afa / Lansia",
        program: b.program,
        location: b.location,
      })),
      pagination: {
        currentPage: safePage,
        pageSize: safeLimit,
        totalItems,
        totalPages,
      },
    };
  } catch (err) {
    console.error("Prisma getBeneficiaries error:", err);
    return {
      items: [],
      pagination: {
        currentPage: 1,
        pageSize,
        totalItems: 0,
        totalPages: 1,
      },
    };
  }
}
