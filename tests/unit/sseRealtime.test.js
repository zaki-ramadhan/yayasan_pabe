import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  registerAdminSSEClient,
  unregisterAdminSSEClient,
  broadcastAdminEvent,
} from "@/lib/sseBroadcast";
import prisma from "@/lib/prisma";
import { settleDonationStatus } from "@/services/donationService";

// Mock Prisma
vi.mock("@/lib/prisma", () => {
  const mockDonation = {
    findUnique: vi.fn(),
    update: vi.fn(),
  };
  const mockCampaign = {
    update: vi.fn(),
  };
  const mockActivityLog = {
    create: vi.fn(),
  };
  const mockVolunteer = {
    create: vi.fn(),
  };

  return {
    default: {
      donation: mockDonation,
      campaign: mockCampaign,
      activityLog: mockActivityLog,
      volunteer: mockVolunteer,
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

describe("Real-Time Event Architecture & SSE Broadcast", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sseBroadcast Manager", () => {
    it("mendaftarkan dan menghapus controller stream SSE secara aman", () => {
      const mockController = {
        enqueue: vi.fn(),
      };

      registerAdminSSEClient(mockController);
      broadcastAdminEvent("TEST_EVENT", { message: "hello" });

      expect(mockController.enqueue).toHaveBeenCalledTimes(1);

      unregisterAdminSSEClient(mockController);
      broadcastAdminEvent("TEST_EVENT", { message: "after_unregister" });

      // Tetap 1 kali karena sudah di-unregister
      expect(mockController.enqueue).toHaveBeenCalledTimes(1);
    });

    it("menghapus controller zombie secara otomatis jika enqueue melempar error (koneksi putus)", () => {
      const brokenController = {
        enqueue: vi.fn().mockImplementation(() => {
          throw new Error("Controller closed / stream aborted");
        }),
      };
      const healthyController = {
        enqueue: vi.fn(),
      };

      registerAdminSSEClient(brokenController);
      registerAdminSSEClient(healthyController);

      // Pertama kali: keduanya dipanggil, broken melempar error dan dihapus dari set
      broadcastAdminEvent("FIRST_PING", { id: 1 });
      expect(healthyController.enqueue).toHaveBeenCalledTimes(1);

      // Kedua kali: brokenController tidak boleh lagi dipanggil karena sudah dibersihkan
      broadcastAdminEvent("SECOND_PING", { id: 2 });
      expect(brokenController.enqueue).toHaveBeenCalledTimes(1);
      expect(healthyController.enqueue).toHaveBeenCalledTimes(2);

      unregisterAdminSSEClient(healthyController);
    });
  });

  describe("settleDonationStatus & Real-time Integration", () => {
    it("memancarkan event DONATION_PAID saat donasi berhasil dilunasi", async () => {
      const mockController = {
        enqueue: vi.fn(),
      };
      registerAdminSSEClient(mockController);

      prisma.donation.findUnique.mockResolvedValueOnce({
        id: "don_realtime_1",
        invoiceId: "INV-REALTIME-001",
        status: "PENDING",
        amount: 250000,
        totalAmount: 250000,
        donorName: "Ahmad Zaki",
        donorEmail: "ahmad.zaki@example.com",
        donorPhone: "081234567890",
        isAnonymous: false,
        paymentChannel: "qris",
        campaignId: "camp_1",
        campaign: { id: "camp_1", title: "Sedekah Anak Yatim", slug: "sedekah-anak-yatim" },
        createdAt: new Date(),
      });

      prisma.donation.update.mockResolvedValueOnce({
        id: "don_realtime_1",
        invoiceId: "INV-REALTIME-001",
        status: "PAID",
        amount: 250000,
        totalAmount: 250000,
        donorName: "Ahmad Zaki",
        donorEmail: "ahmad.zaki@example.com",
        donorPhone: "081234567890",
        isAnonymous: false,
        paymentChannel: "qris",
        paidAt: new Date("2026-11-05T10:00:00Z"),
        createdAt: new Date("2026-11-05T09:00:00Z"),
      });

      prisma.campaign.update.mockResolvedValueOnce({ id: "camp_1" });

      const result = await settleDonationStatus("INV-REALTIME-001", new Date("2026-11-05T10:00:00Z"));

      expect(result).toBeDefined();
      expect(result.status).toBe("PAID");

      // Controller SSE harus menerima event DONATION_PAID
      expect(mockController.enqueue).toHaveBeenCalledTimes(1);

      const decoder = new TextDecoder();
      const encodedPayload = mockController.enqueue.mock.calls[0][0];
      const stringPayload = decoder.decode(encodedPayload);

      expect(stringPayload).toContain("event: DONATION_PAID");
      expect(stringPayload).toContain("INV-REALTIME-001");
      expect(stringPayload).toContain("Sedekah Anak Yatim");

      unregisterAdminSSEClient(mockController);
    });

    it("tidak memancarkan event ganda jika donasi sudah berstatus PAID (Idempotent Guard)", async () => {
      const mockController = {
        enqueue: vi.fn(),
      };
      registerAdminSSEClient(mockController);

      prisma.donation.findUnique.mockResolvedValueOnce({
        id: "don_already_paid",
        invoiceId: "INV-ALREADY-PAID",
        status: "PAID",
        amount: 100000,
        totalAmount: 100000,
      });

      const result = await settleDonationStatus("INV-ALREADY-PAID");

      expect(result.status).toBe("PAID");
      expect(mockController.enqueue).not.toHaveBeenCalled();

      unregisterAdminSSEClient(mockController);
    });
  });
});

