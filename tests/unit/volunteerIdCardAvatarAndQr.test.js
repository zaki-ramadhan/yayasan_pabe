import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import {
  getAdminVolunteers,
  updateVolunteerStatus,
} from "@/services/adminVolunteerService";
import * as emailService from "@/services/emailService";
import {
  shouldSendStatusEmail,
  resetStatusEmailCooldown,
  clearEmailDispatchHistory,
} from "@/lib/emailDispatchGuard";

describe("Volunteer ID Card Avatar, QR, & Admin Flow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearEmailDispatchHistory();
  });

  describe("getAdminVolunteers Avatar Linking", () => {
    it("menautkan avatar akun User asli ke data relawan berdasarkan kecocokan email", async () => {
      const mockVolunteers = [
        {
          id: "vol-1",
          fullName: "Fauzi Rahmat",
          email: "fauzi@example.com",
          phone: "08123456789",
          city: "Jakarta",
          interest: "Pendidikan",
          motivation: "Ingin berbagi",
          status: "APPROVED",
          createdAt: new Date("2026-01-01T00:00:00.000Z"),
        },
        {
          id: "vol-2",
          fullName: "Dewi Lestari",
          email: "dewi@example.com",
          phone: "08123456788",
          city: "Bandung",
          interest: "Kesehatan",
          motivation: "Bakti sosial",
          status: "PENDING",
          createdAt: new Date("2026-01-02T00:00:00.000Z"),
        },
      ];

      vi.spyOn(prisma.volunteer, "count").mockResolvedValueOnce(2);
      vi.spyOn(prisma.volunteer, "findMany").mockResolvedValueOnce(mockVolunteers);
      vi.spyOn(prisma.user, "findMany").mockResolvedValueOnce([
        {
          email: "fauzi@example.com",
          avatar: "https://r2.storage/fauzi-avatar.webp",
          customAvatar: null,
          providerAvatar: null,
        },
      ]);

      const result = await getAdminVolunteers({ limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.items[0].avatarUrl).toBe("https://r2.storage/fauzi-avatar.webp");
      expect(result.items[1].avatarUrl).toBeNull();
    });
  });

  describe("Email Dispatch Failure & Cooldown Reset", () => {
    it("mereset cooldown pengiriman email jika email service mengalami kendala", async () => {
      const mockVolunteer = {
        id: "vol-err-1",
        fullName: "Budi Santoso",
        email: "budi.santoso@example.com",
        phone: "08123456789",
        city: "Surabaya",
        interest: "Bencana Alam",
        motivation: "Siaga bencana",
        status: "PENDING",
        createdAt: new Date("2026-02-01T00:00:00.000Z"),
      };

      vi.spyOn(prisma.volunteer, "findUnique").mockResolvedValueOnce(mockVolunteer);
      vi.spyOn(prisma.volunteer, "update").mockResolvedValueOnce({
        ...mockVolunteer,
        status: "APPROVED",
      });

      // Simulasi error email service
      vi.spyOn(emailService, "sendVolunteerApprovedEmail").mockRejectedValueOnce(
        new Error("Resend rate limit exceeded")
      );

      // Eksekusi update status (shouldSendStatusEmail akan dipanggil di dalam)
      await updateVolunteerStatus("vol-err-1", "APPROVED");

      // Karena pengiriman gagal, cooldown harus sudah direset sehingga boleh dicoba ulang
      const canRetry = shouldSendStatusEmail("budi.santoso@example.com", "APPROVED");
      expect(canRetry).toBe(true);
    });

    it("resetStatusEmailCooldown menghapus riwayat pengiriman untuk email dan status terkait", () => {
      shouldSendStatusEmail("test@example.com", "APPROVED");
      expect(shouldSendStatusEmail("test@example.com", "APPROVED")).toBe(false);

      resetStatusEmailCooldown("test@example.com", "APPROVED");
      expect(shouldSendStatusEmail("test@example.com", "APPROVED")).toBe(true);
    });
  });

  describe("Simplified 3-State Volunteer Statuses (Notion-Style)", () => {
    it("menolak status yang tidak valid atau sudah usang (misal CONTACTED)", async () => {
      await expect(
        updateVolunteerStatus("vol-test-1", "CONTACTED")
      ).rejects.toThrow("Status pendaftar relawan tidak valid.");

      await expect(
        updateVolunteerStatus("vol-test-1", "INVALID_STATUS")
      ).rejects.toThrow("Status pendaftar relawan tidak valid.");
    });
  });
});
