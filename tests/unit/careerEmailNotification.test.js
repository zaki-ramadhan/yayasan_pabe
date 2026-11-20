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
    beforeEach(() => {
      vi.spyOn(prisma.jobApplication, "findFirst").mockResolvedValue(null);
      vi.spyOn(prisma.jobApplication, "count").mockResolvedValue(0);
    });

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

    it("berhasil menerima lamaran kerja dengan berkas CV hasil unggahan internal (/api/media/...)", async () => {
      const sendEmailSpy = vi.spyOn(emailService, "sendEmail").mockResolvedValueOnce({ success: true });

      vi.spyOn(prisma.jobVacancy, "findFirst").mockResolvedValueOnce({
        id: "vac-001",
        title: "Staff Fundraising & Kemitraan",
        department: "Fundraising & Program",
        applyUrl: "ONLINE_FORM",
        jobCode: "JOB-01",
      });

      vi.spyOn(prisma.jobApplication, "create").mockResolvedValueOnce({
        id: "app-002",
        vacancyId: "vac-001",
        fullName: "Burhanuddin",
        email: "xburhanuddin3@gmail.com",
        phone: "081214772370",
        coverLetter: "Saya ingin belajar pengalaman nyata dalam kehidupan bermasyarakat.",
        resumeUrl: "/api/media/careers/resumes/job-cv_file_123.pdf",
        status: "PENDING",
        createdAt: new Date("2026-11-19T10:00:00Z"),
      });

      vi.spyOn(prisma.user, "findFirst").mockResolvedValueOnce(null);

      const result = await submitJobApplication({
        vacancyId: "vac-001",
        fullName: "Burhanuddin",
        email: "xburhanuddin3@gmail.com",
        phone: "081214772370",
        coverLetter: "Saya ingin belajar pengalaman nyata dalam kehidupan bermasyarakat.",
        resumeUrl: "/api/media/careers/resumes/job-cv_file_123.pdf",
      });

      expect(result.success).toBe(true);
      expect(result.data.fullName).toBe("Burhanuddin");
      expect(result.data.email).toBe("xburhanuddin3@gmail.com");
    });
  });
});
