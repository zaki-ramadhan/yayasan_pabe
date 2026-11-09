import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma
vi.mock("@/lib/prisma", () => {
  const mockDonations = new Map();
  const mockCampaigns = new Map();

  const prismaMock = {
    donation: {
      findUnique: vi.fn(async ({ where }) => {
        return mockDonations.get(where.invoiceId) || null;
      }),
      update: vi.fn(async ({ where, data }) => {
        const existing = mockDonations.get(where.invoiceId) || {};
        const updated = { ...existing, ...data };
        mockDonations.set(where.invoiceId, updated);
        return updated;
      }),
      aggregate: vi.fn(async ({ where }) => {
        let sum = 0;
        let count = 0;
        for (const d of mockDonations.values()) {
          if (
            (!where.campaignId || d.campaignId === where.campaignId) &&
            (!where.status || d.status === where.status)
          ) {
            sum += Number(d.amount || 0);
            count += 1;
          }
        }
        return {
          _sum: { amount: sum },
          _count: { id: count },
        };
      }),
    },
    campaign: {
      findUnique: vi.fn(async ({ where }) => {
        return mockCampaigns.get(where.id) || null;
      }),
      update: vi.fn(async ({ where, data }) => {
        const existing = mockCampaigns.get(where.id) || { collectedAmount: 0, donorCount: 0 };
        const updated = {
          ...existing,
          collectedAmount: data.collectedAmount ?? existing.collectedAmount,
          donorCount: data.donorCount ?? existing.donorCount,
        };
        mockCampaigns.set(where.id, updated);
        return updated;
      }),
    },
    activityLog: {
      create: vi.fn().mockResolvedValue({ id: "act_1" }),
    },
    $transaction: vi.fn(async (cb) => {
      return cb(prismaMock);
    }),
  };

  prismaMock.__mockDonations = mockDonations;
  prismaMock.__mockCampaigns = mockCampaigns;

  return { default: prismaMock };
});

vi.mock("@/lib/sseBroadcast", () => ({
  broadcastAdminEvent: vi.fn(),
}));

vi.mock("@/services/midtransService", () => ({
  invalidateMidtransStatusCache: vi.fn(),
}));

describe("Dev Simulator Status & Anti-Inflation Guard", () => {
  let prisma;
  let settleDonationStatus;

  beforeEach(async () => {
    vi.clearAllMocks();
    const prismaModule = await import("@/lib/prisma");
    prisma = prismaModule.default;
    prisma.__mockDonations.clear();
    prisma.__mockCampaigns.clear();

    const donModule = await import("@/services/donationService");
    settleDonationStatus = donModule.settleDonationStatus;
  });

  it("mencegah penggelembungan dana saat siklus PAID -> EXPIRED -> PAID diulang", async () => {
    const campaignId = "camp_peduli_1";
    const invoiceId = "INV-SIMULATOR-001";
    const amount = 50000;

    prisma.__mockCampaigns.set(campaignId, {
      id: campaignId,
      title: "Peduli Anak Yatim",
      collectedAmount: 0,
      donorCount: 0,
    });

    prisma.__mockDonations.set(invoiceId, {
      id: "don_1",
      invoiceId,
      amount,
      totalAmount: amount,
      status: "PENDING",
      campaignId,
      paidAt: null,
    });

    // 1. Bayar Lunas pertama kali
    await settleDonationStatus(invoiceId, new Date());
    let camp = prisma.__mockCampaigns.get(campaignId);
    expect(camp.collectedAmount).toBe(50000);
    expect(camp.donorCount).toBe(1);

    // 2. Simulasi Expired / Cancel (Rollback)
    await prisma.$transaction(async (tx) => {
      await tx.donation.update({
        where: { invoiceId },
        data: { status: "EXPIRED", paidAt: null },
      });
      const agg = await tx.donation.aggregate({
        where: { campaignId, status: "PAID" },
        _sum: { amount: true },
        _count: { id: true },
      });
      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          collectedAmount: Number(agg._sum.amount || 0),
          donorCount: Number(agg._count.id || 0),
        },
      });
    });

    camp = prisma.__mockCampaigns.get(campaignId);
    expect(camp.collectedAmount).toBe(0);
    expect(camp.donorCount).toBe(0);

    // 3. Bayar Lunas kedua kali
    await settleDonationStatus(invoiceId, new Date());
    camp = prisma.__mockCampaigns.get(campaignId);
    // Tidak boleh bertambah jadi 100.000! Harus tetap 50.000!
    expect(camp.collectedAmount).toBe(50000);
    expect(camp.donorCount).toBe(1);

    // 4. Simulasi Reset ke Pending (Rollback)
    await prisma.$transaction(async (tx) => {
      await tx.donation.update({
        where: { invoiceId },
        data: { status: "PENDING", paidAt: null },
      });
      const agg = await tx.donation.aggregate({
        where: { campaignId, status: "PAID" },
        _sum: { amount: true },
        _count: { id: true },
      });
      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          collectedAmount: Number(agg._sum.amount || 0),
          donorCount: Number(agg._count.id || 0),
        },
      });
    });

    camp = prisma.__mockCampaigns.get(campaignId);
    expect(camp.collectedAmount).toBe(0);
    expect(camp.donorCount).toBe(0);

    // 5. Bayar Lunas ketiga kali
    await settleDonationStatus(invoiceId, new Date());
    camp = prisma.__mockCampaigns.get(campaignId);
    // Harus tetap 50.000!
    expect(camp.collectedAmount).toBe(50000);
    expect(camp.donorCount).toBe(1);
  });
});

