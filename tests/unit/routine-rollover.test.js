import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  selectRolloverCampaign,
  calculateFundingRatio,
  compareCampaignUrgency,
  DEFAULT_GENERAL_PROGRAM,
} from "@/services/routineRolloverSelector";
import {
  rolloverOrCompleteRoutineDonationsForCampaign,
  rolloverOrCompleteSingleRoutineDonation,
} from "@/services/routineCompletionService";
import { buildRoutineRolloverWhatsAppMessage } from "@/services/whatsapp/rolloverTemplate";
import { isRoutineScheduledForNow } from "@/lib/routineSchedulerHelper";
import { calculateDonationExpiryDate } from "@/lib/donationExpiryConstants";

// Mock dependencies
vi.mock("@/services/whatsapp", () => ({
  sendWhatsAppNotification: vi.fn().mockResolvedValue({ success: true, provider: "mock" }),
  sendWhatsAppCompletionNotification: vi.fn().mockResolvedValue({ success: true, provider: "mock" }),
  sendWhatsAppRolloverNotification: vi.fn().mockResolvedValue({ success: true, provider: "mock" }),
}));

vi.mock("@/services/emailService", () => ({
  sendRoutineDonationEmail: vi.fn().mockResolvedValue({ success: true }),
  sendRoutineCompletionEmail: vi.fn().mockResolvedValue({ success: true }),
  sendRoutineRolloverEmail: vi.fn().mockResolvedValue({ success: true }),
  sendRoutinePausedDueToUnpaidEmail: vi.fn().mockResolvedValue({ success: true }),
  sendDonationReceiptEmail: vi.fn().mockResolvedValue({ success: true }),
}));

describe("Smart Rollover Donasi Rutin (Selector & Service)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Selector Engine Logic", () => {
    it("menghitung rasio pendanaan dengan benar", () => {
      // 20jt dari 100jt = 0.2
      expect(calculateFundingRatio({ collectedAmount: 20000000, targetAmount: 100000000 })).toBeCloseTo(0.2);
      // Tanpa target (evergreen) = baseline 0.5
      expect(calculateFundingRatio({ collectedAmount: 50000000, targetAmount: null })).toBe(0.5);
    });

    it("membandingkan urgensi: mendahulukan capaian terendah (paling membutuhkan dana)", () => {
      const campA = { id: "a", collectedAmount: 80000000, targetAmount: 100000000 }; // 0.8
      const campB = { id: "b", collectedAmount: 15000000, targetAmount: 100000000 }; // 0.15

      // campB harus lebih diprioritaskan daripada campA (return negatif jika b di depan a)
      expect(compareCampaignUrgency(campB, campA)).toBeLessThan(0);
      expect(compareCampaignUrgency(campA, campB)).toBeGreaterThan(0);
    });

    it("memilih program dalam kategori yang sama dengan rasio terendah", async () => {
      const mockPrisma = {
        campaign: {
          findUnique: vi.fn().mockResolvedValue({ categoryId: "cat-yatim" }),
          findMany: vi.fn().mockResolvedValue([
            {
              id: "camp-yatim-1",
              title: "Santunan Yatim Bulanan",
              categoryId: "cat-yatim",
              collectedAmount: 8000000,
              targetAmount: 10000000, // 0.8
              endDate: null,
            },
            {
              id: "camp-yatim-2",
              title: "Beasiswa Yatim Dhuafa",
              categoryId: "cat-yatim",
              collectedAmount: 2000000,
              targetAmount: 10000000, // 0.2 (Paling butuh dana)
              endDate: null,
            },
            {
              id: "camp-dakwah-1",
              title: "Renovasi Masjid",
              categoryId: "cat-dakwah",
              collectedAmount: 1000000,
              targetAmount: 10000000, // 0.1 (Kategori beda)
              endDate: null,
            },
          ]),
        },
      };

      const selected = await selectRolloverCampaign({
        currentCampaignId: "camp-old",
        currentCategoryId: "cat-yatim",
        prismaClient: mockPrisma,
      });

      expect(selected).not.toBeNull();
      expect(selected.id).toBe("camp-yatim-2");
      expect(selected.title).toBe("Beasiswa Yatim Dhuafa");
    });

    it("melakukan fallback ke kategori lain jika kategori sama tidak memiliki program aktif", async () => {
      const mockPrisma = {
        campaign: {
          findUnique: vi.fn().mockResolvedValue({ categoryId: "cat-darurat" }),
          findMany: vi.fn().mockResolvedValue([
            {
              id: "camp-umum-1",
              title: "Sedekah Subuh PABE (Umum)",
              categoryId: "cat-umum",
              isFeatured: true,
              collectedAmount: 1000000,
              targetAmount: 50000000,
              endDate: null,
            },
          ]),
        },
      };

      const selected = await selectRolloverCampaign({
        currentCampaignId: "camp-banjir",
        currentCategoryId: "cat-darurat",
        prismaClient: mockPrisma,
      });

      expect(selected).not.toBeNull();
      expect(selected.id).toBe("camp-umum-1");
    });

    it("melakukan fallback ke DEFAULT_GENERAL_PROGRAM jika tidak ada program spesifik yang aktif", async () => {
      const mockPrisma = {
        campaign: {
          findUnique: vi.fn().mockResolvedValue({ categoryId: "cat-yatim" }),
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const selected = await selectRolloverCampaign({
        currentCampaignId: "camp-last",
        currentCategoryId: "cat-yatim",
        prismaClient: mockPrisma,
        allowGeneralFallback: true,
      });

      expect(selected).toEqual(DEFAULT_GENERAL_PROGRAM);
      expect(selected.id).toBeNull();
      expect(selected.isGeneral).toBe(true);
    });

    it("mengembalikan null jika allowGeneralFallback disetel false dan tidak ada program aktif", async () => {
      const mockPrisma = {
        campaign: {
          findUnique: vi.fn().mockResolvedValue({ categoryId: "cat-yatim" }),
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const selected = await selectRolloverCampaign({
        currentCampaignId: "camp-last",
        currentCategoryId: "cat-yatim",
        prismaClient: mockPrisma,
        allowGeneralFallback: false,
      });

      expect(selected).toBeNull();
    });
  });

  describe("End-of-Month Clamp (isRoutineScheduledForNow)", () => {
    it("mengeksekusi donasi rutin tanggal 31 di tanggal 28 Februari (bulan non-kabisat)", () => {
      // Donatur memilih tanggal 31
      const routine = {
        status: "ACTIVE",
        frequency: "MONTHLY",
        monthlyDate: "2026-01-31T05:00:00.000Z", // tgl 31
        reminderTime: "05:00",
      };

      // Waktu saat ini: 28 Februari 2026 jam 05:00 WIB (UTC+7)
      const feb28Date = new Date("2026-02-28T05:00:00+07:00");
      expect(isRoutineScheduledForNow(routine, feb28Date)).toBe(true);

      // Waktu saat ini: 27 Februari 2026 jam 05:00 WIB -> Tidak boleh dieksekusi
      const feb27Date = new Date("2026-02-27T05:00:00+07:00");
      expect(isRoutineScheduledForNow(routine, feb27Date)).toBe(false);
    });

    it("mengeksekusi donasi rutin tanggal 31 di tanggal 30 April", () => {
      const routine = {
        status: "ACTIVE",
        frequency: "MONTHLY",
        monthlyDate: "2026-01-31T05:00:00.000Z", // tgl 31
        reminderTime: "05:00",
      };

      // 30 April jam 05:00 WIB
      const apr30Date = new Date("2026-04-30T05:00:00+07:00");
      expect(isRoutineScheduledForNow(routine, apr30Date)).toBe(true);
    });
  });

  describe("QRIS 24-Hour Expiry Window for Routine Donations", () => {
    it("memberikan batas waktu 24 jam untuk tagihan donasi rutin", () => {
      const now = new Date("2026-11-10T05:00:00+07:00");
      const expiry = calculateDonationExpiryDate("qris", "QRIS", now, { isRoutine: true });

      const diffHours = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60);
      expect(diffHours).toBe(24);
    });

    it("tetap mempertahankan batas waktu standar (15 menit) untuk donasi reguler QRIS non-rutin", () => {
      const now = new Date("2026-11-10T05:00:00+07:00");
      const expiry = calculateDonationExpiryDate("qris", "QRIS", now, { isRoutine: false });

      const diffMinutes = (expiry.getTime() - now.getTime()) / (1000 * 60);
      expect(diffMinutes).toBe(15);
    });
  });

  describe("Service: rolloverOrCompleteRoutineDonationsForCampaign", () => {
    it("mengalihkan komitmen donasi ke program baru dan mengirim notifikasi transparansi", async () => {
      const { sendRoutineRolloverEmail } = await import("@/services/emailService");

      const mockPrisma = {
        routineDonation: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "routine-1",
              campaignId: "camp-old",
              status: "ACTIVE",
              donorName: "Budi Santoso",
              donorEmail: "budi@example.com",
              donorPhone: "081234567890",
              programTitle: "Program Air Bersih Lama",
              campaign: { id: "camp-old", categoryId: "cat-sosial", title: "Program Air Bersih Lama" },
            },
          ]),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        campaign: {
          findUnique: vi.fn().mockResolvedValue({ categoryId: "cat-sosial" }),
          findMany: vi.fn().mockResolvedValue([
            {
              id: "camp-new",
              title: "Pembangunan Sumur Wakaf",
              categoryId: "cat-sosial",
              collectedAmount: 500000,
              targetAmount: 10000000,
              endDate: null,
            },
          ]),
        },
        activityLog: {
          create: vi.fn().mockResolvedValue({ id: "log-1" }),
        },
      };

      const result = await rolloverOrCompleteRoutineDonationsForCampaign("camp-old", {
        reason: "Program target tercapai",
        notifyDonors: true,
        prismaClient: mockPrisma,
      });

      expect(result.action).toBe("ROLLED_OVER");
      expect(result.targetCampaign.id).toBe("camp-new");
      expect(result.updatedCount).toBe(1);
      expect(result.notifiedCount).toBe(1);

      // Verifikasi update komitmen ke target campaign baru
      expect(mockPrisma.routineDonation.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["routine-1"] } },
        data: {
          campaignId: "camp-new",
          programTitle: "Pembangunan Sumur Wakaf",
        },
      });

      // Verifikasi pencatatan log audit
      expect(mockPrisma.activityLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: "ROUTINE_AUTO_ROLLOVER",
          targetType: "Campaign",
          targetId: "camp-old",
        }),
      });

      // Verifikasi pengiriman email transparansi
      expect(sendRoutineRolloverEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "budi@example.com",
          donorName: "Budi Santoso",
          oldProgramTitle: "Program Air Bersih Lama",
          newProgramTitle: "Pembangunan Sumur Wakaf",
        })
      );
    });

    it("melakukan fallback ke Program Umum Yayasan jika allowGeneralFallback diaktifkan", async () => {
      const mockPrisma = {
        routineDonation: {
          findMany: vi.fn().mockResolvedValue([
            {
              id: "routine-isolated",
              campaignId: "camp-isolated",
              status: "ACTIVE",
              donorName: "Siti",
              donorEmail: "siti@example.com",
              programTitle: "Program Terakhir",
              campaign: { id: "camp-isolated", categoryId: "cat-special", title: "Program Terakhir" },
            },
          ]),
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        },
        campaign: {
          findUnique: vi.fn().mockResolvedValue({ categoryId: "cat-special" }),
          findMany: vi.fn().mockResolvedValue([]), // Tidak ada campaign lain
        },
        activityLog: {
          create: vi.fn().mockResolvedValue({ id: "log-complete" }),
        },
      };

      const result = await rolloverOrCompleteRoutineDonationsForCampaign("camp-isolated", {
        reason: "Ditutup admin",
        notifyDonors: true,
        prismaClient: mockPrisma,
      });

      // Default: selesai aman (COMPLETED) jika tidak ada program pengganti
      expect(result.action).toBe("COMPLETED");
      expect(mockPrisma.routineDonation.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ["routine-isolated"] } },
        data: { status: "COMPLETED" },
      });
    });
  });

  describe("Service: rolloverOrCompleteSingleRoutineDonation", () => {
    it("mengalihkan single routine saat fail-safe mendeteksi program ditutup", async () => {
      const mockPrisma = {
        routineDonation: {
          findUnique: vi.fn().mockResolvedValue({
            id: "routine-single-1",
            campaignId: "camp-closed",
            status: "ACTIVE",
            donorName: "Ahmad",
            donorEmail: "ahmad@example.com",
            programTitle: "Program Ditutup",
            campaign: { id: "camp-closed", categoryId: "cat-yatim", title: "Program Ditutup" },
          }),
          update: vi.fn().mockResolvedValue({
            id: "routine-single-1",
            campaignId: "camp-rollover-target",
            programTitle: "Target Baru",
          }),
        },
        campaign: {
          findUnique: vi.fn().mockResolvedValue({ categoryId: "cat-yatim" }),
          findMany: vi.fn().mockResolvedValue([
            {
              id: "camp-rollover-target",
              title: "Target Baru",
              categoryId: "cat-yatim",
              collectedAmount: 1000000,
              targetAmount: 50000000,
              endDate: null,
            },
          ]),
        },
        activityLog: {
          create: vi.fn().mockResolvedValue({ id: "log-single" }),
        },
      };

      const result = await rolloverOrCompleteSingleRoutineDonation("routine-single-1", {
        notifyDonor: true,
        prismaClient: mockPrisma,
      });

      expect(result.action).toBe("ROLLED_OVER");
      expect(result.targetCampaign.id).toBe("camp-rollover-target");
      expect(mockPrisma.routineDonation.update).toHaveBeenCalledWith({
        where: { id: "routine-single-1" },
        data: {
          campaignId: "camp-rollover-target",
          programTitle: "Target Baru",
        },
      });
    });
  });

  describe("WhatsApp Rollover Template", () => {
    it("menghasilkan teks pesan WA pengalihan yang transparan dan sopan", () => {
      const text = buildRoutineRolloverWhatsAppMessage({
        donorName: "Hendra Wijaya",
        oldProgramTitle: "Bantuan Banjir Demak",
        newProgramTitle: "Santunan Pangan Yatim",
        actionUrl: "https://yayasanpabe.org/donatur/dashboard",
      });

      expect(text).toContain("Bapak/Ibu Hendra Wijaya");
      expect(text).toContain("Bantuan Banjir Demak");
      expect(text).toContain("Santunan Pangan Yatim");
      expect(text).toContain("dialihkan secara otomatis");
      expect(text).toContain("https://yayasanpabe.org/donatur/dashboard");
    });
  });

  describe("Consecutive Unpaid Guard (Scheduler)", () => {
    it("menjeda jadwal donasi rutin jika 3 tagihan sebelumnya kedaluwarsa berturut-turut", async () => {
      const { processScheduledRoutineDonations } = await import("@/services/routineDonationSchedulerService");
      const { sendRoutinePausedDueToUnpaidEmail } = await import("@/services/emailService");

      const mockRoutine = {
        id: "routine-unpaid-3x",
        campaignId: "camp-active-1",
        status: "ACTIVE",
        routineType: "AUTO_DONATION",
        amount: 25000,
        frequency: "DAILY",
        reminderTime: "05:00",
        donorName: "Fajar",
        donorEmail: "fajar@example.com",
        donorPhone: "081299998888",
        programTitle: "Program Tetap",
        campaign: { id: "camp-active-1", status: "ACTIVE", title: "Program Tetap" },
      };

      const mockPrisma = (await import("@/lib/prisma")).default;

      // Mock routine data
      mockPrisma.routineDonation.findMany = vi.fn().mockResolvedValue([mockRoutine]);
      mockPrisma.routineDonation.update = vi.fn().mockResolvedValue({
        ...mockRoutine,
        status: "PAUSED",
      });

      // Mock 3 tagihan sebelumnya berstatus EXPIRED
      mockPrisma.donation.findMany = vi.fn().mockResolvedValue([
        { id: "don-1", invoiceId: "INV-001", status: "EXPIRED" },
        { id: "don-2", invoiceId: "INV-002", status: "EXPIRED" },
        { id: "don-3", invoiceId: "INV-003", status: "EXPIRED" },
      ]);
      mockPrisma.activityLog.create = vi.fn().mockResolvedValue({ id: "log-pause" });
      mockPrisma.activityLog.findFirst = vi.fn().mockResolvedValue(null);

      const targetTime = new Date("2026-11-10T05:00:00+07:00");
      const summary = await processScheduledRoutineDonations({
        currentTime: targetTime,
        forceRoutineId: null,
      });

      expect(summary.skipped).toBe(1);
      expect(summary.details[0].status).toBe("AUTO_PAUSED");
      expect(mockPrisma.routineDonation.update).toHaveBeenCalledWith({
        where: { id: "routine-unpaid-3x" },
        data: { status: "PAUSED" },
      });
      expect(sendRoutinePausedDueToUnpaidEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "fajar@example.com",
          donorName: "Fajar",
          programTitle: "Program Tetap",
        })
      );
    }, 20000);
  });

  describe("Payment Channel Support in Email (QRIS vs Virtual Account vs Reminder)", () => {
    it("menampilkan tombol QRIS dan label QRIS saat saluran donasi adalah qris", async () => {
      const { buildRoutineDonationInvoiceEmailHtml } = await import(
        "@/templates/emails/routineDonationInvoiceEmailTemplate"
      );

      const html = buildRoutineDonationInvoiceEmailHtml({
        donorName: "Ahmad",
        programTitle: "Sedekah Subuh",
        amount: 50000,
        frequencyText: "Setiap Pekan (Jumat)",
        invoiceId: "INV-ROUTINE-QRIS-001",
        actionUrl: "https://yayasanpabe.org/invoice/INV-ROUTINE-QRIS-001",
        routineType: "AUTO_DONATION",
        paymentChannel: "qris",
      });

      expect(html).toContain("Tunaikan Donasi via QRIS");
      expect(html).toContain("QRIS (Semua Bank & E-Wallet)");
      expect(html).toContain("kode QRIS");
      expect(html).toContain("INV-ROUTINE-QRIS-001");
    });

    it("menampilkan tombol VA dan rincian bank saat saluran donasi adalah bca_va", async () => {
      const { buildRoutineDonationInvoiceEmailHtml } = await import(
        "@/templates/emails/routineDonationInvoiceEmailTemplate"
      );

      const html = buildRoutineDonationInvoiceEmailHtml({
        donorName: "Budi",
        programTitle: "Santunan Yatim",
        amount: 100000,
        frequencyText: "Setiap Bulan (Tgl 1)",
        invoiceId: "INV-ROUTINE-VA-002",
        actionUrl: "https://yayasanpabe.org/invoice/INV-ROUTINE-VA-002",
        routineType: "AUTO_DONATION",
        paymentChannel: "bca_va",
      });

      expect(html).toContain("Buka Instruksi Pembayaran VA");
      expect(html).toContain("BCA Virtual Account");
      expect(html).toContain("nomor Virtual Account");
      expect(html).toContain("INV-ROUTINE-VA-002");
    });

    it("menampilkan pesan pengingat ramah tanpa tagihan saat mode REMINDER_ONLY", async () => {
      const { buildRoutineDonationInvoiceEmailHtml } = await import(
        "@/templates/emails/routineDonationInvoiceEmailTemplate"
      );

      const html = buildRoutineDonationInvoiceEmailHtml({
        donorName: "Siti",
        programTitle: "Wakaf Al-Qur'an",
        amount: 0,
        frequencyText: "Setiap Pekan (Jumat)",
        actionUrl: "https://yayasanpabe.org/campaign/wakaf-quran",
        routineType: "REMINDER_ONLY",
      });

      expect(html).toContain("Buka Program Donasi");
      expect(html).toContain("Mengingatkan kembali bahwa hari ini adalah jadwal kebaikan donasi rutin Anda");
      expect(html).not.toContain("Nomor Tagihan");
    });
  });
});
