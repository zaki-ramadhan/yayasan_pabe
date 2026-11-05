import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildCareerApplicationEmailHtml,
  getCareerApplicationEmailSubject,
} from "@/templates/emails/careerApplicationEmailTemplate";
import * as emailService from "@/services/emailService";
import { submitJobApplication } from "@/services/careerService";
import prisma from "@/lib/prisma";

describe("Career Application Transactional Email System", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Career Application Email Template", () => {
    it("menghasilkan markup HTML dengan posisi, pelamar, dan subjek yang tepat", () => {
      const subject = getCareerApplicationEmailSubject("Frontend Developer");
      const html = buildCareerApplicationEmailHtml({
        name: "Hendra Wijaya",
        position: "Frontend Developer",
        department: "Teknologi Informasi",
      });

      expect(subject).toContain("Konfirmasi Penerimaan Berkas Lamaran - Frontend Developer");
      expect(html).toContain("Hendra Wijaya");
      expect(html).toContain("Frontend Developer");
      expect(html).toContain("Teknologi Informasi");
      expect(html).toContain("REVIEWING");
    });
  });

  describe("Service Integration & Email Triggers", () => {
    it("mengirim email konfirmasi saat pelamar berhasil submit lowongan", async () => {
      const sendEmailSpy = vi
        .spyOn(emailService, "sendCareerApplicationEmail")
        .mockResolvedValueOnce({ success: true });

      vi.spyOn(prisma.jobVacancy, "findFirst").mockResolvedValueOnce({
        id: "vac-001",
        title: "Staff Fundraising & Kemitraan",
        department: "Fundraising & Program",
        applyUrl: "https://payungberkah.org/careers",
      });

      vi.spyOn(prisma.jobApplication, "create").mockResolvedValueOnce({
        id: "app-001",
        vacancyId: "vac-001",
        fullName: "Hendra Wijaya",
        email: "hendra.wijaya@example.com",
        phone: "081234567890",
        coverLetter: "Saya sangat tertarik bergabung untuk berkontribusi di yayasan.",
        status: "PENDING",
        createdAt: new Date("2026-11-05T10:00:00Z"),
      });

      vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce(null);

      const result = await submitJobApplication({
        vacancyId: "vac-001",
        fullName: "Hendra Wijaya",
        email: "hendra.wijaya@example.com",
        phone: "081234567890",
        coverLetter: "Saya sangat tertarik bergabung untuk berkontribusi di yayasan.",
        resumeUrl: "https://pub-d695853be49c485484cd7799dc192352.r2.dev/resumes/cv.pdf",
      });

      expect(result.success).toBe(true);
      expect(sendEmailSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "hendra.wijaya@example.com",
          name: "Hendra Wijaya",
          position: "Staff Fundraising & Kemitraan",
          department: "Fundraising & Program",
        })
      );
    });
  });
});
