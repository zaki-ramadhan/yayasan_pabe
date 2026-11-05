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
      // Distinct campaigns call
      if (query.distinct) {
        return [{ campaignId: "camp-1", donationType: "CAMPAIGN" }];
      }

      // Pastikan orderBy menggunakan createdAt desc murni (bukan paidAt nullable yang memicu NULLS FIRST di PostgreSQL)
      expect(query.orderBy).toEqual({ createdAt: "desc" });

      // Return mock data: 1 transaksi PAID hari ini, 1 transaksi EXPIRED kemarin
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
    // Transaksi paling baru (5 Nov 2026) WAJIB berada di urutan pertama (indeks 0)
    expect(result.items[0].id).toBe("don-newest");
    expect(result.items[0].status).toBe("PAID");
    expect(result.items[0].amount).toBe(6000000);

    // Transaksi lama (3 Nov 2026 - EXPIRED) berada di bawahnya
    expect(result.items[1].id).toBe("don-older-expired");
    expect(result.items[1].status).toBe("EXPIRED");
  });
});
