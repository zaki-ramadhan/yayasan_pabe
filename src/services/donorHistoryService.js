import prisma from "@/lib/prisma";
import { isCampaignClosed } from "@/lib/formatters";
import { buildUserWhereClause } from "./donorAnalyticsHelper";
import { getPendingInvoicesForUser } from "./donationExpiryService";
import {
  ZIS_DONATION_WHERE,
  buildDonationTypeWhere,
  isZisTransaction,
} from "@/lib/zisFilter";

export async function getDonorHistory({
  userEmail,
  userName,
  userPhone,
  status = "ALL",
  type = "ALL",
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
    const campaignOnlyWhere = buildDonationTypeWhere("CAMPAIGN");
    const [aggregates, distinctCampaigns, zakatAggregates, campaignAggregates] = await Promise.all([
      prisma.donation.aggregate({
        where: basePaidWhere,
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.findMany({
        where: basePaidWhere,
        select: {
          campaignId: true,
          donationType: true,
          campaign: {
            select: {
              slug: true,
              category: { select: { slug: true, name: true } },
            },
          },
        },
        distinct: ["campaignId", "donationType"],
      }),
      prisma.donation.aggregate({
        where: { ...basePaidWhere, ...ZIS_DONATION_WHERE },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.donation.aggregate({
        where: { ...basePaidWhere, ...campaignOnlyWhere },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    const totalNominal = aggregates?._sum?.amount || 0;
    const totalTransactions = aggregates?._count?.id || 0;
    const totalPrograms = distinctCampaigns.length;
    const totalZakatPrograms = distinctCampaigns.filter((d) => isZisTransaction(d)).length;
    const totalCampaignPrograms = Math.max(0, totalPrograms - totalZakatPrograms);

    const filterConditions = [userCondition];
    if (status && status.toUpperCase() !== "ALL") {
      filterConditions.push({ status: status.toUpperCase() });
    }

    if (type && type.toUpperCase() !== "ALL") {
      const typeWhere = buildDonationTypeWhere(type);
      if (Object.keys(typeWhere).length > 0) {
        filterConditions.push(typeWhere);
      }
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

    let orderByClause = { createdAt: normalizedSortOrder };
    if (sortBy === "nominal" || sortBy === "amount") {
      orderByClause = { amount: normalizedSortOrder };
    } else if (sortBy === "program") {
      orderByClause = { campaign: { title: normalizedSortOrder } };
    } else if (sortBy === "payment" || sortBy === "channel") {
      orderByClause = { paymentChannel: normalizedSortOrder };
    } else if (sortBy === "name") {
      orderByClause = { donorName: normalizedSortOrder };
    }

    const pendingInvoicesData = await getPendingInvoicesForUser({
      userEmail,
      userName,
      userPhone,
      limit: 10,
    }).catch(() => []);

    const [filteredCount, donations] = await Promise.all([
      prisma.donation.count({ where: finalWhere }),
      prisma.donation.findMany({
        where: finalWhere,
        include: {
          campaign: {
            select: {
              title: true,
              slug: true,
              status: true,
              endDate: true,
              category: {
                select: {
                  slug: true,
                  name: true,
                },
              },
            },
          },
        },
        orderBy: orderByClause,
        skip,
        take: pageLimit,
      }),
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

      const campaignUnavailable = d.campaign
        ? isCampaignClosed(d.campaign) || d.campaign.status === "PAUSED"
        : d.donationType !== "ZAKAT" && d.donationType !== "INFAK_SUBUH";

      return {
        id: d.id,
        no: skip + index + 1,
        invoiceId: d.invoiceId,
        donorName: d.isAnonymous ? "Hamba Allah" : d.donorName,
        amount: d.amount,
        programTitle: effectiveProgramTitle,
        campaignSlug: d.campaign?.slug || "",
        campaignStatus: d.campaign?.status || null,
        isCampaignClosed: campaignUnavailable,
        canDonateAgain: !campaignUnavailable,
        categorySlug: d.campaign?.category?.slug || "",
        categoryName: d.campaign?.category?.name || "",
        paymentChannel: d.paymentChannel || "QRIS",
        date: (d.createdAt || d.paidAt).toISOString(),
        status: d.status,
        donationType: d.donationType || "CAMPAIGN",
        isZis: isZisTransaction(d),
      };
    });

    const totalPages = Math.ceil(filteredCount / pageLimit);

    return {
      metrics: {
        totalNominal,
        totalTransactions,
        totalPrograms,
        totalZakatNominal: zakatAggregates?._sum?.amount || 0,
        totalZakatTransactions: zakatAggregates?._count?.id || 0,
        totalZakatPrograms,
        totalCampaignNominal: campaignAggregates?._sum?.amount || 0,
        totalCampaignTransactions: campaignAggregates?._count?.id || 0,
        totalCampaignPrograms,
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
