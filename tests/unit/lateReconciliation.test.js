import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { settleDonationStatus } from "@/services/donationService";
import { cancelAndExpirePendingDonation } from "@/services/donationExpiryService";
import { DONATION_STATUS } from "@/lib/donationExpiryConstants";

// Mock Prisma
vi.mock("@/lib/prisma", () => {
  const mockDonation = {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  };
  const mockCampaign = {
    update: vi.fn(),
  };
  const mockActivityLog = {
    create: vi.fn(),
  };

  return {
    default: {
      donation: mockDonation,
      campaign: mockCampaign,
      activityLog: mockActivityLog,
      $transaction: vi.fn(async (cb) => {
        return cb({
          donation: mockDonation,
          campaign: mockCampaign,
          activityLog: mockActivityLog,
        });
      }),
    },
  };
});

// Mock Midtrans Service
vi.mock("@/services/midtransService", () => ({
  expireMidtransOrder: vi.fn().mockResolvedValue({ status_code: "200" }),
  checkMidtransOrderStatus: vi.fn().mockResolvedValue({ isPaid: false }),
}));

describe("Late Payment Webhook & Invoice Expiry Reconciliation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("settleDonationStatus (Idempotensi & Late Reconciliation)", () => {
    it("memproses pembayaran donasi berstatus PENDING secara normal tanpa activity log rekonsiliasi", () => {
      prisma.donation.findUnique.mockResolvedValueOnce({
        id: "don_1",
        invoiceId: "INV-001",
        status: "PENDING",
        amount: 150000,
        campaignId: "camp_1",
      });

      prisma.donation.update.mockResolvedValueOnce({
        id: "don_1",
        invoiceId: "INV-001",
        status: "PAID",
        paidAt: new Date(),
      });

      return settleDonationStatus("INV-001").then((result) => {
        expect(result.status).toBe("PAID");
        expect(prisma.campaign.update).toHaveBeenCalledWith({
          where: { id: "camp_1" },
          data: {
            collectedAmount: { increment: 150000 },
            donorCount: { increment: 1 },
          },
        });
        expect(prisma.activityLog.create).not.toHaveBeenCalled();
      });
    });

    it("menjamin idempotensi: tidak melakukan mutasi berulang jika transaksi sudah PAID", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({
        id: "don_1",
        invoiceId: "INV-001",
        status: "PAID",
        amount: 150000,
      });

      const result = await settleDonationStatus("INV-001");

      expect(result.status).toBe("PAID");
      expect(prisma.donation.update).not.toHaveBeenCalled();
      expect(prisma.campaign.update).not.toHaveBeenCalled();
      expect(prisma.activityLog.create).not.toHaveBeenCalled();
    });

    it("melakukan rekonsiliasi transaksi terlambat (Late Webhook) saat invoice sebelumnya telah EXPIRED", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({
        id: "don_expired",
        invoiceId: "INV-LATE-001",
        status: "EXPIRED",
        amount: 500000,
        campaignId: "camp_2",
      });

      prisma.donation.update.mockResolvedValueOnce({
        id: "don_expired",
        invoiceId: "INV-LATE-001",
        status: "PAID",
        paidAt: new Date(),
      });

      const result = await settleDonationStatus("INV-LATE-001");

      expect(result.status).toBe("PAID");
      expect(prisma.campaign.update).toHaveBeenCalledWith({
        where: { id: "camp_2" },
        data: {
          collectedAmount: { increment: 500000 },
          donorCount: { increment: 1 },
        },
      });

      expect(prisma.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: "PAYMENT_LATE_RECONCILIATION",
          targetType: "DONATION",
          targetId: "don_expired",
          userName: "SYSTEM_RECONCILER",
          userRole: "SYSTEM",
        }),
      });
    });
  });

  describe("cancelAndExpirePendingDonation", () => {
    it("berhasil membatalkan tagihan donasi PENDING dan mengembalikan struktur data yang benar tanpa ReferenceError", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({
        id: "don_pending",
        invoiceId: "INV-CANCEL-001",
        status: DONATION_STATUS.PENDING,
        donorEmail: "donatur@example.com",
        donorName: "Budi",
      });

      prisma.donation.updateMany.mockResolvedValueOnce({ count: 1 });

      const authUser = {
        email: "donatur@example.com",
        name: "Budi",
        role: "DONOR",
      };

      const result = await cancelAndExpirePendingDonation("INV-CANCEL-001", authUser);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        invoiceId: "INV-CANCEL-001",
        status: DONATION_STATUS.CANCELLED,
      });
    });

    it("menolak pembatalan tagihan donasi milik donatur lain (Anti-IDOR)", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({
        id: "don_pending",
        invoiceId: "INV-CANCEL-002",
        status: DONATION_STATUS.PENDING,
        donorEmail: "korban@example.com",
        donorName: "Korban",
      });

      const maliciousUser = {
        email: "attacker@example.com",
        name: "Attacker",
        role: "DONOR",
      };

      const result = await cancelAndExpirePendingDonation("INV-CANCEL-002", maliciousUser);

      expect(result.success).toBe(false);
      expect(result.message).toContain("tidak berhak membatalkan");
      expect(prisma.donation.updateMany).not.toHaveBeenCalled();
    });

    it("menolak pembatalan jika tagihan donasi sudah berstatus PAID", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({
        id: "don_paid",
        invoiceId: "INV-CANCEL-003",
        status: DONATION_STATUS.PAID,
        donorEmail: "donatur@example.com",
      });

      const authUser = {
        email: "donatur@example.com",
        role: "DONOR",
      };

      const result = await cancelAndExpirePendingDonation("INV-CANCEL-003", authUser);

      expect(result.success).toBe(false);
      expect(result.message).toContain("sudah terbayar tidak dapat dibatalkan");
      expect(prisma.donation.updateMany).not.toHaveBeenCalled();
    });
  });
});
