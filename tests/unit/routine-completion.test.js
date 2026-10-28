import { describe, it, expect, vi, beforeEach } from "vitest";
import { buildRoutineCompletionWhatsAppMessage } from "@/services/whatsapp/completionTemplate";
import { ROUTINE_STATUS, VALID_ROUTINE_STATUSES } from "@/lib/routineDonationConstants";

// Mock Prisma
vi.mock("@/lib/prisma", () => {
  return {
    default: {
      routineDonation: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      activityLog: {
        create: vi.fn(),
        findFirst: vi.fn(),
      },
      donation: {
        create: vi.fn(),
      },
      notificationQueue: {
        findUnique: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
      notificationLog: {
        create: vi.fn(),
      },
    },
  };
});

// Mock WhatsApp Driver
vi.mock("@/services/whatsapp", () => {
  return {
    sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true, provider: "mock" }),
    sendWhatsAppCompletionNotification: vi.fn().mockResolvedValue({ success: true, provider: "mock" }),
  };
});

describe("Donasi Rutin Penutupan Program (Opsi A)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Constants & Validation", () => {
    it("memastikan ROUTINE_STATUS mencakup COMPLETED secara valid", () => {
      expect(ROUTINE_STATUS.COMPLETED).toBe("COMPLETED");
      expect(VALID_ROUTINE_STATUSES).toContain("COMPLETED");
      expect(VALID_ROUTINE_STATUSES).toContain("ACTIVE");
      expect(VALID_ROUTINE_STATUSES).toContain("PAUSED");
      expect(VALID_ROUTINE_STATUSES).toContain("CANCELLED");
    });
  });

  describe("WhatsApp Completion Message Template", () => {
    it("menghasilkan teks pesan penutupan resmi dengan transparansi penghentian tagihan", () => {
      const message = buildRoutineCompletionWhatsAppMessage({
        donorName: "Ahmad Zaki",
        programTitle: "Renovasi Asrama Yatim Tahfidz",
        catalogUrl: "https://yayasanpabe.org/program",
      });

      expect(message).toContain("Halo Bapak/Ibu Ahmad Zaki");
      expect(message).toContain("Renovasi Asrama Yatim Tahfidz");
      expect(message).toContain("resmi ditutup/tercapai dan siap disalurkan");
      expect(message).toContain("jadwal komitmen donasi rutin Anda untuk program ini telah dihentikan secara otomatis");
      expect(message).toContain("https://yayasanpabe.org/program");
    });

    it("menggunakan sapaan ramah Sahabat Kebaikan jika nama donatur Hamba Allah atau kosong", () => {
      const message = buildRoutineCompletionWhatsAppMessage({
        donorName: "Hamba Allah",
        programTitle: "Sedekah Pangan Lansia",
      });

      expect(message).toContain("Halo Sahabat Kebaikan");
      expect(message).toContain("Sedekah Pangan Lansia");
    });
  });

  describe("Service: completeRoutineDonationsForCampaign", () => {
    it("menyelesaikan seluruh komitmen donasi rutin aktif saat kampanye ditutup", async () => {
      const prisma = (await import("@/lib/prisma")).default;
      const { sendWhatsAppCompletionNotification } = await import("@/services/whatsapp");
      const { completeRoutineDonationsForCampaign } = await import("@/services/routineCompletionService");

      const mockRoutines = [
        {
          id: "routine-1",
          campaignId: "camp-100",
          status: "ACTIVE",
          donorName: "Budi Santoso",
          donorPhone: "081234567890",
          programTitle: "Program Air Bersih",
        },
        {
          id: "routine-2",
          campaignId: "camp-100",
          status: "ACTIVE",
          donorName: "Siti Aminah",
          donorPhone: "089876543210",
          programTitle: "Program Air Bersih",
        },
      ];

      prisma.routineDonation.findMany.mockResolvedValueOnce(mockRoutines);
      prisma.routineDonation.updateMany.mockResolvedValueOnce({ count: 2 });
      prisma.activityLog.create.mockResolvedValueOnce({ id: "log-1" });

      const result = await completeRoutineDonationsForCampaign("camp-100", {
        reason: "Target tercapai dan siap disalurkan",
        notifyDonors: true,
      });

      expect(result.updatedCount).toBe(2);
      expect(result.notifiedCount).toBe(2);
      expect(result.errors).toHaveLength(0);

      // Verifikasi query update status ke COMPLETED
      expect(prisma.routineDonation.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["routine-1", "routine-2"] } },
        data: { status: "COMPLETED" },
      });

      // Verifikasi pengiriman pesan WA penutupan
      expect(sendWhatsAppCompletionNotification).toHaveBeenCalledTimes(2);
      expect(sendWhatsAppCompletionNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "081234567890",
          donorName: "Budi Santoso",
          programTitle: "Program Air Bersih",
        })
      );
    });

    it("mengembalikan zero count dengan aman jika tidak ada jadwal rutin aktif pada campaign tersebut", async () => {
      const prisma = (await import("@/lib/prisma")).default;
      const { completeRoutineDonationsForCampaign } = await import("@/services/routineCompletionService");

      prisma.routineDonation.findMany.mockResolvedValueOnce([]);

      const result = await completeRoutineDonationsForCampaign("camp-empty");
      expect(result.updatedCount).toBe(0);
      expect(result.notifiedCount).toBe(0);
    });
  });

  describe("Service: Fail-Safe Cron Scheduler Protection", () => {
    it("melewati eksekusi dan otomatis menyelesaikan jadwal jika program berstatus COMPLETED", async () => {
      const prisma = (await import("@/lib/prisma")).default;
      const { processScheduledRoutineDonations } = await import("@/services/routineDonationSchedulerService");

      const inactiveRoutine = {
        id: "routine-inactive-1",
        campaignId: "camp-closed",
        status: "ACTIVE",
        routineType: "AUTO_DONATION",
        amount: 50000,
        frequency: "DAILY",
        reminderTime: "05:00",
        donorName: "Ahmad",
        donorPhone: "08111222333",
        programTitle: "Program Ditutup",
        campaign: {
          id: "camp-closed",
          title: "Program Ditutup",
          status: "COMPLETED", // Campaign sudah COMPLETED!
        },
      };

      prisma.routineDonation.findMany.mockResolvedValueOnce([inactiveRoutine]);
      prisma.routineDonation.findUnique.mockResolvedValueOnce(inactiveRoutine);
      prisma.routineDonation.update.mockResolvedValueOnce({
        ...inactiveRoutine,
        status: "COMPLETED",
      });

      const scheduleDate = new Date("2026-10-26T05:00:00+07:00");
      const summary = await processScheduledRoutineDonations({
        currentTime: scheduleDate,
        forceRoutineId: "routine-inactive-1",
      });

      // Harus di-skip dan diubah jadi COMPLETED, bukan diproses membuat invoice!
      expect(summary.skipped).toBe(1);
      expect(summary.succeeded).toBe(0);
      expect(summary.details[0].status).toBe("AUTO_COMPLETED");
      expect(prisma.donation.create).not.toHaveBeenCalled();
    });
  });
});
