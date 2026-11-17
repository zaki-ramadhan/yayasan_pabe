import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { getDonorHistory } from "@/services/donorHistoryService";

vi.mock("@/lib/prisma", () => ({
  default: {
    donation: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock("@/services/donorAnalyticsHelper", () => ({
  buildUserWhereClause: vi.fn().mockReturnValue({ donorEmail: "zaki@example.com" }),
}));

vi.mock("@/services/donationExpiryService", () => ({
  getPendingInvoicesForUser: vi.fn().mockResolvedValue([]),
}));

describe("Donor History Service - Chronological Sorting Audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("melakukan pengurutan kronologis berdasarkan createdAt murni agar transaksi terbaru selalu di atas tanpa pengelompokan status", async () => {
    prisma.donation.aggregate.mockResolvedValueOnce({
      _sum: { amount: 6700000 },
      _count: { id: 2 },
    });

    prisma.donation.findMany.mockImplementation(async (query) => {
      if (query.distinct) {
        return [{ campaignId: "camp-1", donationType: "CAMPAIGN" }];
      }

      expect(query.orderBy).toEqual({ createdAt: "desc" });

      return [
        {
          id: "don-newest",
          invoiceId: "INV-NEWEST-001",
          donorName: "Zaki Ramadhan",
          amount: 6000000,
          paymentChannel: "QRIS",
          status: "PAID",
          paidAt: new Date("2026-11-05T10:31:00Z"),
          createdAt: new Date("2026-11-05T10:30:00Z"),
          campaign: { title: "Bimbel PABE Smart", slug: "bimbel-pabe-smart" },
        },
        {
          id: "don-older-expired",
          invoiceId: "INV-EXPIRED-001",
          donorName: "Zaki Ramadhan",
          amount: 425000,
          paymentChannel: "GoPay",
          status: "EXPIRED",
          paidAt: null, // Nullable!
          createdAt: new Date("2026-11-03T07:53:00Z"),
          campaign: { title: "Zakat Maal", slug: "zakat-maal" },
        },
      ];
    });

    prisma.donation.count.mockResolvedValueOnce(2);

    const result = await getDonorHistory({
      userEmail: "zaki@example.com",
      userName: "Zaki Ramadhan",
      status: "ALL",
      sortBy: "date",
      sortOrder: "desc",
    });

    expect(result.items.length).toBe(2);
    expect(result.items[0].id).toBe("don-newest");
    expect(result.items[0].status).toBe("PAID");
    expect(result.items[0].amount).toBe(6000000);

    expect(result.items[1].id).toBe("don-older-expired");
    expect(result.items[1].status).toBe("EXPIRED");
  });

  it("menandai canDonateAgain false jika program ditutup, dijeda, atau dihapus", async () => {
    prisma.donation.aggregate.mockResolvedValue({
      _sum: { amount: 0 },
      _count: { id: 0 },
    });

    prisma.donation.findMany.mockImplementation(async (query) => {
      if (query.distinct) return [];
      return [
        {
          id: "don-closed",
          invoiceId: "INV-CLOSED-1",
          donorName: "Budi",
          amount: 50000,
          paymentChannel: "qris",
          status: "EXPIRED",
          donationType: "CAMPAIGN",
          createdAt: new Date("2026-11-01T10:00:00Z"),
          campaign: { title: "Program Selesai", slug: "selesai", status: "COMPLETED" },
        },
        {
          id: "don-deleted",
          invoiceId: "INV-DELETED-1",
          donorName: "Budi",
          amount: 50000,
          paymentChannel: "qris",
          status: "EXPIRED",
          donationType: "CAMPAIGN",
          createdAt: new Date("2026-11-01T09:00:00Z"),
          campaign: null,
        },
        {
          id: "don-active",
          invoiceId: "INV-ACTIVE-1",
          donorName: "Budi",
          amount: 50000,
          paymentChannel: "qris",
          status: "EXPIRED",
          donationType: "CAMPAIGN",
          createdAt: new Date("2026-11-01T08:00:00Z"),
          campaign: { title: "Program Aktif", slug: "aktif", status: "ACTIVE" },
        },
      ];
    });

    prisma.donation.count.mockResolvedValueOnce(3);

    const result = await getDonorHistory({
      userEmail: "budi@example.com",
      userName: "Budi",
    });

    expect(result.items[0].canDonateAgain).toBe(false);
    expect(result.items[0].isCampaignClosed).toBe(true);
    expect(result.items[1].canDonateAgain).toBe(false);
    expect(result.items[1].isCampaignClosed).toBe(true);
    expect(result.items[2].canDonateAgain).toBe(true);
    expect(result.items[2].isCampaignClosed).toBe(false);
  });

  it("menerapkan query status in [EXPIRED, CANCELLED, FAILED] saat filter status FAILED dipilih", async () => {
    prisma.donation.aggregate.mockResolvedValue({
      _sum: { amount: 0 },
      _count: { id: 0 },
    });

    let capturedWhere = null;
    prisma.donation.findMany.mockImplementation(async (query) => {
      if (query.distinct) return [];
      capturedWhere = query.where;
      return [];
    });

    prisma.donation.count.mockResolvedValueOnce(0);

    await getDonorHistory({
      userEmail: "budi@example.com",
      userName: "Budi",
      status: "FAILED",
    });

    expect(capturedWhere.AND).toContainEqual({
      status: {
        in: ["EXPIRED", "CANCELLED", "FAILED"],
      },
    });
  });

  it("menjaga kondisi identitas donatur pada zakatAggregates dan campaignAggregates tanpa collision object spread", async () => {
    const aggregateCalls = [];
    prisma.donation.aggregate.mockImplementation(async (query) => {
      aggregateCalls.push(query);
      if (aggregateCalls.length === 1) {
        return { _sum: { amount: 7175000 }, _count: { id: 5 } };
      }
      if (aggregateCalls.length === 2) {
        return { _sum: { amount: 250000 }, _count: { id: 1 } };
      }
      return { _sum: { amount: 6925000 }, _count: { id: 4 } };
    });

    prisma.donation.findMany.mockImplementation(async (query) => {
      if (query.distinct) {
        return [
          { campaignId: "camp-zakat", donationType: "CAMPAIGN", campaign: { slug: "zakat-maal", category: { slug: "zakat" } } },
          { campaignId: "camp-1", donationType: "CAMPAIGN", campaign: { slug: "camp-1", category: { slug: "pendidikan" } } },
          { campaignId: "camp-2", donationType: "CAMPAIGN", campaign: { slug: "camp-2", category: { slug: "yatim" } } },
          { campaignId: "camp-3", donationType: "CAMPAIGN", campaign: { slug: "camp-3", category: { slug: "bencana" } } },
          { campaignId: "camp-4", donationType: "CAMPAIGN", campaign: { slug: "camp-4", category: { slug: "kesehatan" } } },
        ];
      }
      return [];
    });

    prisma.donation.count.mockResolvedValueOnce(0);

    const result = await getDonorHistory({
      userEmail: "zaki@example.com",
      userName: "Zaki Ramadhan",
    });

    expect(aggregateCalls.length).toBe(3);

    expect(aggregateCalls[0].where.status).toBe("PAID");
    expect(aggregateCalls[0].where.AND).toEqual([{ donorEmail: "zaki@example.com" }]);

    expect(aggregateCalls[1].where.AND).toBeDefined();
    expect(aggregateCalls[1].where.AND[0]).toEqual({
      status: "PAID",
      AND: [{ donorEmail: "zaki@example.com" }],
    });

    expect(aggregateCalls[2].where.AND).toBeDefined();
    expect(aggregateCalls[2].where.AND[0]).toEqual({
      status: "PAID",
      AND: [{ donorEmail: "zaki@example.com" }],
    });

    expect(result.metrics.totalNominal).toBe(7175000);
    expect(result.metrics.totalTransactions).toBe(5);
    expect(result.metrics.totalPrograms).toBe(5);

    expect(result.metrics.totalZakatNominal).toBe(250000);
    expect(result.metrics.totalZakatTransactions).toBe(1);
    expect(result.metrics.totalZakatPrograms).toBe(1);

    expect(result.metrics.totalCampaignNominal).toBe(6925000);
    expect(result.metrics.totalCampaignTransactions).toBe(4);
    expect(result.metrics.totalCampaignPrograms).toBe(4);
  });
});
