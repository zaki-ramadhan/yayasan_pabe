import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildVolunteerRegistrationEmailHtml,
  VOLUNTEER_REGISTRATION_EMAIL_SUBJECT,
} from "@/templates/emails/volunteerRegistrationEmailTemplate";
import {
  buildVolunteerApprovalEmailHtml,
  VOLUNTEER_APPROVAL_EMAIL_SUBJECT,
} from "@/templates/emails/volunteerApprovalEmailTemplate";
import * as emailService from "@/services/emailService";
import { registerVolunteer } from "@/services/volunteerService";
import {
  updateVolunteerStatus,
  updateVolunteersStatusBatch,
} from "@/services/adminVolunteerService";
import prisma from "@/lib/prisma";

describe("Volunteer Transactional Email & Approval System", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Volunteer Registration Email Template", () => {
    it("menghasilkan markup HTML dengan data pendaftar dan subjek yang tepat", () => {
      const html = buildVolunteerRegistrationEmailHtml({
        name: "Fauzan Hakim",
        city: "Bandung",
        interest: "Pendidikan & Dakwah",
        statusUrl: "https://payungberkah.org/volunteer",
      });

      expect(VOLUNTEER_REGISTRATION_EMAIL_SUBJECT).toContain("Pendaftaran Relawan Diterima");
      expect(html).toContain("Fauzan Hakim");
      expect(html).toContain("Bandung");
      expect(html).toContain("Pendidikan & Dakwah");
      expect(html).toContain("PENDING");
      expect(html).toContain("https://payungberkah.org/volunteer");
    });
  });

  describe("Volunteer Approval Email Template", () => {
    it("menghasilkan markup sertifikasi resmi dengan nomor ID relawan", () => {
      const html = buildVolunteerApprovalEmailHtml({
        name: "Siti Rahma",
        volunteerId: "YPABE-202611-042",
        validationUrl: "https://payungberkah.org/relawan/validasi/vol-123",
      });

      expect(VOLUNTEER_APPROVAL_EMAIL_SUBJECT).toContain("Disetujui");
      expect(html).toContain("Siti Rahma");
      expect(html).toContain("YPABE-202611-042");
      expect(html).toContain("RESMI TERVERIFIKASI");
      expect(html).toContain("https://payungberkah.org/relawan/validasi/vol-123");
    });
  });

  describe("Service Integration & Email Triggers", () => {
    it("mengirim email konfirmasi saat pendaftar mencantumkan alamat email valid", async () => {
      const sendEmailSpy = vi
        .spyOn(emailService, "sendVolunteerRegistrationEmail")
        .mockResolvedValueOnce({ success: true });

      vi.spyOn(prisma.volunteer, "create").mockResolvedValueOnce({
        id: "vol-new-1",
        fullName: "Ahmad Dahlan",
        email: "ahmad.dahlan@example.com",
        phone: "081234567890",
        city: "Yogyakarta",
        interest: "Bantuan Kemanusiaan",
        status: "PENDING",
      });

      vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce(null);

      const result = await registerVolunteer({
        fullName: "Ahmad Dahlan",
        email: "ahmad.dahlan@example.com",
        phone: "081234567890",
        city: "Yogyakarta",
        interest: "Bantuan Kemanusiaan",
      });

      expect(result.success).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "ahmad.dahlan@example.com",
          name: "Ahmad Dahlan",
          city: "Yogyakarta",
        })
      );
    });

    it("mengirim email persetujuan resmi saat admin menyetujui relawan", async () => {
      const sendApprovalSpy = vi
        .spyOn(emailService, "sendVolunteerApprovedEmail")
        .mockResolvedValueOnce({ success: true });

      vi.spyOn(prisma.volunteer, "update").mockResolvedValueOnce({
        id: "vol-approved-1",
        fullName: "Fatimah Azzahra",
        email: "fatimah@example.com",
        status: "APPROVED",
        createdAt: new Date("2026-11-01T10:00:00Z"),
      });

      const updated = await updateVolunteerStatus("vol-approved-1", "APPROVED");

      expect(updated.status).toBe("APPROVED");
      expect(sendApprovalSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "fatimah@example.com",
          name: "Fatimah Azzahra",
          validationUrl: expect.stringContaining("/relawan/validasi/vol-approved-1"),
        })
      );
    });

    it("mengirim email persetujuan batch saat admin menyetujui banyak relawan sekaligus", async () => {
      const sendApprovalSpy = vi
        .spyOn(emailService, "sendVolunteerApprovedEmail")
        .mockResolvedValue({ success: true });

      vi.spyOn(prisma.volunteer, "updateMany").mockResolvedValueOnce({ count: 2 });
      vi.spyOn(prisma.volunteer, "findMany").mockResolvedValueOnce([
        {
          id: "vol-batch-1",
          fullName: "Relawan Satu",
          email: "satu@example.com",
          createdAt: new Date("2026-11-01T10:00:00Z"),
        },
        {
          id: "vol-batch-2",
          fullName: "Relawan Dua",
          email: "dua@example.com",
          createdAt: new Date("2026-11-01T10:00:00Z"),
        },
      ]);

      const result = await updateVolunteersStatusBatch(["vol-batch-1", "vol-batch-2"], "APPROVED");

      expect(result.count).toBe(2);
      expect(sendApprovalSpy).toHaveBeenCalledTimes(2);
    });
  });
});
