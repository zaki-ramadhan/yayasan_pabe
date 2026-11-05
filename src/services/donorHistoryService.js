import prisma from "@/lib/prisma";
import { buildUserWhereClause } from "./donorAnalyticsHelper";
import { getPendingInvoicesForUser } from "./donationExpiryService";

export async function getDonorHistory({
  userEmail,
  userName,
  userPhone,
  status = "ALL",
  search = "",
  sortBy = "date",
  sortOrder = "desc",
  page = 1,
  limit = 25,
}) {
  const currentPage = Math.max(1, parseInt(page, 10) || 1);
  const pageLimit = Math.max(1, Math.min(100, parseInt(limit, 10) || 25));
  const skip = (currentPage - 1) * pageLimit;
  const normalizedSortOrder = sortOrder === "asc" ? "asc" : "desc";

  const userCondition = buildUserWhereClause(userEmail, userName, userPhone);
  if (!userCondition) {
    return {
      metrics: {
        totalNominal: 0,
        totalTransactions: 0,
        totalPrograms: 0,
      },
      items: [],
      pendingInvoices: [],
      pagination: {
        total: 0,
        totalPages: 0,
        currentPage,
        limit: pageLimit,
      },
    };
  }

  const basePaidWhere = {
    status: "PAID",
    ...userCondition,
  };

  try {
    const [aggregates, distinctCampaigns] = await Promise.all([
      prisma.donation.aggregate({
        where: basePaidWhere,
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.findMany({
        where: basePaidWhere,
        select: { campaignId: true, donationType: true },
        distinct: ["campaignId", "donationType"],
      }),
    ]);

    const totalNominal = aggregates._sum.amount || 0;
    const totalTransactions = aggregates._count.id || 0;
    const totalPrograms = distinctCampaigns.length;

    const filterConditions = [userCondition];
    if (status && status.toUpperCase() !== "ALL") {
      filterConditions.push({ status: status.toUpperCase() });
    }

    if (search && typeof search === "string" && search.trim().length > 0) {
      const q = search.trim();
      filterConditions.push({
        OR: [
          { invoiceId: { contains: q, mode: "insensitive" } },
          { donorName: { contains: q, mode: "insensitive" } },
          { paymentChannel: { contains: q, mode: "insensitive" } },
          { campaign: { title: { contains: q, mode: "insensitive" } } },
        ],
      });
    }

    const finalWhere = { AND: filterConditions };

    let orderByClause = [{ paidAt: normalizedSortOrder }, { createdAt: normalizedSortOrder }];
    if (sortBy === "nominal" || sortBy === "amount") {
      orderByClause = { amount: normalizedSortOrder };
    } else if (sortBy === "program") {
      orderByClause = { campaign: { title: normalizedSortOrder } };
    } else if (sortBy === "payment" || sortBy === "channel") {
      orderByClause = { paymentChannel: normalizedSortOrder };
    } else if (sortBy === "name") {
      orderByClause = { donorName: normalizedSortOrder };
    }

    const [filteredCount, donations, pendingInvoicesData] = await Promise.all([
      prisma.donation.count({ where: finalWhere }),
      prisma.donation.findMany({
        where: finalWhere,
        include: {
          campaign: {
            select: {
              title: true,
              slug: true,
            },
          },
        },
        orderBy: orderByClause,
        skip,
        take: pageLimit,
      }),
      getPendingInvoicesForUser({ userEmail, userName, limit: 10 }).catch(() => []),
    ]);

    const pendingInvoices = Array.isArray(pendingInvoicesData) ? pendingInvoicesData : [];

    const items = donations.map((d, index) => {
      const effectiveProgramTitle =
        d.campaign?.title ||
        (d.donationType === "ZAKAT"
          ? "Zakat Penghasilan & Mal"
          : d.donationType === "INFAK_SUBUH"
          ? "Sedekah Subuh Berkah"
          : d.donationType === "WAKAF"
          ? "Wakaf Produktif PABE"
          : "Sedekah Umum PABE");

      return {
        id: d.id,
        no: skip + index + 1,
        invoiceId: d.invoiceId,
        donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
        amount: d.amount,
        programTitle: effectiveProgramTitle,
        campaignSlug: d.campaign?.slug || "",
        paymentChannel: d.paymentChannel || "QRIS",
        date: (d.paidAt || d.createdAt).toISOString(),
        status: d.status,
      };
    });

    const totalPages = Math.ceil(filteredCount / pageLimit);

    return {
      metrics: {
        totalNominal,
        totalTransactions,
        totalPrograms,
      },
      items,
      pendingInvoices,
      pagination: {
        total: filteredCount,
        totalPages,
        currentPage,
        limit: pageLimit,
      },
    };
  } catch (error) {
    console.error("Error getDonorHistory in donorHistoryService:", error);
    throw error;
  }
}
