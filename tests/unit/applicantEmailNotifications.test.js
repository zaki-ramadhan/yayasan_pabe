import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildVolunteerRejectionEmailHtml,
  VOLUNTEER_REJECTION_EMAIL_SUBJECT,
} from "@/templates/emails/volunteerRejectionEmailTemplate";
import {
  buildCareerShortlistEmailHtml,
  getCareerShortlistEmailSubject,
} from "@/templates/emails/careerShortlistEmailTemplate";
import {
  buildCareerRejectionEmailHtml,
  getCareerRejectionEmailSubject,
} from "@/templates/emails/careerRejectionEmailTemplate";
import * as emailService from "@/services/emailService";
import {
  updateVolunteerStatus,
  updateVolunteersStatusBatch,
} from "@/services/adminVolunteerService";
import { updateApplicationStatus } from "@/services/adminCareerService";
import { clearEmailDispatchHistory } from "@/lib/emailDispatchGuard";
import prisma from "@/lib/prisma";

describe("Applicant Email Notifications (Approval, Shortlist & Rejection)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    clearEmailDispatchHistory();
  });

  describe("Volunteer Rejection Email Template", () => {
    it("menghasilkan markup HTML santun dengan sapaan, bidang minat, dan penjelasan kuota", () => {
      const html = buildVolunteerRejectionEmailHtml({
        name: "Burhanuddin",
        interest: "Relawan Kebaikan",
      });

      expect(VOLUNTEER_REJECTION_EMAIL_SUBJECT).toContain("Pendaftaran Relawan");
      expect(html).toContain("Burhanuddin");
      expect(html).toContain("Relawan Kebaikan");
      expect(html).toContain("Belum Dapat Disetujui");
      expect(html).toContain("Kuota relawan untuk periode kegiatan saat ini telah terpenuhi");
      expect(html).toContain("tersimpan dalam pangkalan data relawan");
    });
  });

  describe("Career Shortlist Email Template", () => {
    it("menghasilkan markup HTML shortlist dengan posisi, divisi, dan instruksi interview", () => {
      const subject = getCareerShortlistEmailSubject("Staff Media & Komunikasi");
      const html = buildCareerShortlistEmailHtml({
        name: "Aulia Nurfadilah",
        position: "Staff Media & Komunikasi",
        department: "Divisi Kreatif & Syiar",
      });

      expect(subject).toContain("Kabar Baik: Seleksi Berkas Lamaran Staff Media & Komunikasi");
      expect(html).toContain("Aulia Nurfadilah");
      expect(html).toContain("Staff Media & Komunikasi");
      expect(html).toContain("Divisi Kreatif & Syiar");
      expect(html).toContain("SHORTLISTED");
      expect(html).toContain("wawancara kerja");
    });
  });

  describe("Career Rejection Email Template", () => {
    it("menghasilkan markup HTML penolakan santun dengan posisi, apresiasi, dan talent pool", () => {
      const subject = getCareerRejectionEmailSubject("Staff Akuntansi & Keuangan");
      const html = buildCareerRejectionEmailHtml({
        name: "Bambang Pamungkas",
        position: "Staff Akuntansi & Keuangan",
        department: "Divisi Keuangan",
      });

      expect(subject).toContain("Pembaruan Status Lamaran: Staff Akuntansi & Keuangan");
      expect(html).toContain("Bambang Pamungkas");
      expect(html).toContain("Staff Akuntansi & Keuangan");
      expect(html).toContain("Divisi Keuangan");
      expect(html).toContain("Proses Seleksi Selesai");
      expect(html).toContain("talent pool");
    });
  });

  describe("Admin Volunteer Service Email Triggers & Safeguards", () => {
    it("mengirim email penolakan santun saat status relawan diubah menjadi REJECTED", async () => {
      const sendRejectionSpy = vi
        .spyOn(emailService, "sendVolunteerRejectionEmail")
        .mockResolvedValueOnce({ success: true });

      vi.spyOn(prisma.volunteer, "findUnique").mockResolvedValueOnce({
        id: "vol-rej-1",
        fullName: "Burhanuddin",
        email: "burhan@example.com",
        interest: "Relawan Kebaikan",
        status: "PENDING",
      });

      vi.spyOn(prisma.volunteer, "update").mockResolvedValueOnce({
        id: "vol-rej-1",
        fullName: "Burhanuddin",
        email: "burhan@example.com",
        interest: "Relawan Kebaikan",
        status: "REJECTED",
      });

      const updated = await updateVolunteerStatus("vol-rej-1", "REJECTED");

      expect(updated.status).toBe("REJECTED");
      expect(sendRejectionSpy).toHaveBeenCalledWith({
        to: "burhan@example.com",
        name: "Burhanuddin",
        interest: "Relawan Kebaikan",
      });
    });

    it("tidak mengirim email ulang jika status yang dipilih sama persis dengan status saat ini (Idempotent)", async () => {
      const sendRejectionSpy = vi.spyOn(emailService, "sendVolunteerRejectionEmail");

      vi.spyOn(prisma.volunteer, "findUnique").mockResolvedValueOnce({
        id: "vol-same-1",
        fullName: "Burhanuddin",
        email: "burhan@example.com",
        interest: "Relawan Kebaikan",
        status: "REJECTED",
      });

      const updateSpy = vi.spyOn(prisma.volunteer, "update");

      const result = await updateVolunteerStatus("vol-same-1", "REJECTED");

      expect(result.status).toBe("REJECTED");
      expect(updateSpy).not.toHaveBeenCalled();
      expect(sendRejectionSpy).not.toHaveBeenCalled();
    });

    it("mencegah pengiriman email duplikat ke relawan yang sama dalam masa cooldown jika status diganti bolak-balik", async () => {
      const sendApprovalSpy = vi
        .spyOn(emailService, "sendVolunteerApprovedEmail")
        .mockResolvedValue({ success: true });

      vi.spyOn(prisma.volunteer, "findUnique").mockResolvedValueOnce({
        id: "vol-flip-1",
        fullName: "Burhanuddin",
        email: "burhan@example.com",
        status: "PENDING",
        createdAt: new Date(),
      });
      vi.spyOn(prisma.volunteer, "update").mockResolvedValueOnce({
        id: "vol-flip-1",
        fullName: "Burhanuddin",
        email: "burhan@example.com",
        status: "APPROVED",
        createdAt: new Date(),
      });

      await updateVolunteerStatus("vol-flip-1", "APPROVED");
      expect(sendApprovalSpy).toHaveBeenCalledTimes(1);

      vi.spyOn(prisma.volunteer, "findUnique").mockResolvedValueOnce({
        id: "vol-flip-1",
        fullName: "Burhanuddin",
        email: "burhan@example.com",
        status: "PENDING",
        createdAt: new Date(),
      });
      vi.spyOn(prisma.volunteer, "update").mockResolvedValueOnce({
        id: "vol-flip-1",
        fullName: "Burhanuddin",
        email: "burhan@example.com",
        status: "APPROVED",
        createdAt: new Date(),
      });

      await updateVolunteerStatus("vol-flip-1", "APPROVED");
      expect(sendApprovalSpy).toHaveBeenCalledTimes(1);
    });

    it("mengirim email penolakan batch saat banyak relawan ditolak sekaligus", async () => {
      const sendRejectionSpy = vi
        .spyOn(emailService, "sendVolunteerRejectionEmail")
        .mockResolvedValue({ success: true });

      vi.spyOn(prisma.volunteer, "updateMany").mockResolvedValueOnce({ count: 2 });
      vi.spyOn(prisma.volunteer, "findMany").mockResolvedValueOnce([
        {
          id: "vol-b1",
          fullName: "Calon Satu",
          email: "calon1@example.com",
          interest: "Pengajar",
        },
        {
          id: "vol-b2",
          fullName: "Calon Dua",
          email: "calon2@example.com",
          interest: "Logistik",
        },
      ]);

      const result = await updateVolunteersStatusBatch(["vol-b1", "vol-b2"], "REJECTED");

      expect(result.count).toBe(2);
      expect(sendRejectionSpy).toHaveBeenCalledTimes(2);
      expect(sendRejectionSpy).toHaveBeenCalledWith(
        expect.objectContaining({ to: "calon1@example.com", name: "Calon Satu" })
      );
      expect(sendRejectionSpy).toHaveBeenCalledWith(
        expect.objectContaining({ to: "calon2@example.com", name: "Calon Dua" })
      );
    });
  });

  describe("Admin Career Service Email Triggers & Safeguards", () => {
    it("mengirim email shortlist saat admin mengubah status lamaran menjadi SHORTLISTED", async () => {
      const sendShortlistSpy = vi
        .spyOn(emailService, "sendCareerShortlistEmail")
        .mockResolvedValueOnce({ success: true });

      vi.spyOn(prisma.jobApplication, "findUnique").mockResolvedValueOnce({
        id: "app-sl-1",
        status: "PENDING",
        vacancy: { title: "Staff Media & Komunikasi", department: "Divisi Kreatif" },
      });

      vi.spyOn(prisma.jobApplication, "update").mockResolvedValueOnce({
        id: "app-sl-1",
        fullName: "Aulia Nurfadilah",
        email: "aulia@example.com",
        status: "SHORTLISTED",
        vacancy: {
          title: "Staff Media & Komunikasi",
          department: "Divisi Kreatif",
        },
      });

      const updated = await updateApplicationStatus("app-sl-1", "SHORTLISTED");

      expect(updated.status).toBe("SHORTLISTED");
      expect(sendShortlistSpy).toHaveBeenCalledWith({
        to: "aulia@example.com",
        name: "Aulia Nurfadilah",
        position: "Staff Media & Komunikasi",
        department: "Divisi Kreatif",
      });
    });

    it("tidak mengirim email jika status yang dipilih sama persis (Idempotent)", async () => {
      const sendShortlistSpy = vi.spyOn(emailService, "sendCareerShortlistEmail");

      vi.spyOn(prisma.jobApplication, "findUnique").mockResolvedValueOnce({
        id: "app-sl-same",
        status: "SHORTLISTED",
        vacancy: { title: "Staff Media", department: "Kreatif" },
      });

      const updateSpy = vi.spyOn(prisma.jobApplication, "update");

      const result = await updateApplicationStatus("app-sl-same", "SHORTLISTED");

      expect(result.status).toBe("SHORTLISTED");
      expect(updateSpy).not.toHaveBeenCalled();
      expect(sendShortlistSpy).not.toHaveBeenCalled();
    });

    it("mengirim email penolakan saat admin mengubah status lamaran menjadi REJECTED", async () => {
      const sendCareerRejectionSpy = vi
        .spyOn(emailService, "sendCareerRejectionEmail")
        .mockResolvedValueOnce({ success: true });

      vi.spyOn(prisma.jobApplication, "findUnique").mockResolvedValueOnce({
        id: "app-rej-1",
        status: "REVIEWED",
        vacancy: { title: "Staff Akuntansi & Keuangan", department: "Divisi Keuangan" },
      });

      vi.spyOn(prisma.jobApplication, "update").mockResolvedValueOnce({
        id: "app-rej-1",
        fullName: "Bambang Pamungkas",
        email: "bambang@example.com",
        status: "REJECTED",
        vacancy: {
          title: "Staff Akuntansi & Keuangan",
          department: "Divisi Keuangan",
        },
      });

      const updated = await updateApplicationStatus("app-rej-1", "REJECTED");

      expect(updated.status).toBe("REJECTED");
      expect(sendCareerRejectionSpy).toHaveBeenCalledWith({
        to: "bambang@example.com",
        name: "Bambang Pamungkas",
        position: "Staff Akuntansi & Keuangan",
        department: "Divisi Keuangan",
      });
    });

    it("tidak mengirim email jika status adalah PENDING atau REVIEWED", async () => {
      const sendShortlistSpy = vi.spyOn(emailService, "sendCareerShortlistEmail");
      const sendRejectionSpy = vi.spyOn(emailService, "sendCareerRejectionEmail");

      vi.spyOn(prisma.jobApplication, "findUnique").mockResolvedValueOnce({
        id: "app-rev-1",
        status: "PENDING",
        vacancy: { title: "Programmer", department: "IT" },
      });

      vi.spyOn(prisma.jobApplication, "update").mockResolvedValueOnce({
        id: "app-rev-1",
        fullName: "Candra Kirana",
        email: "candra@example.com",
        status: "REVIEWED",
        vacancy: {
          title: "Programmer",
          department: "IT",
        },
      });

      const updated = await updateApplicationStatus("app-rev-1", "REVIEWED");

      expect(updated.status).toBe("REVIEWED");
      expect(sendShortlistSpy).not.toHaveBeenCalled();
      expect(sendRejectionSpy).not.toHaveBeenCalled();
    });

    it("tetap mengembalikan data updated walau email service mengalami error (non-blocking)", async () => {
      vi.spyOn(emailService, "sendCareerShortlistEmail").mockRejectedValueOnce(
        new Error("Network timeout")
      );

      vi.spyOn(prisma.jobApplication, "findUnique").mockResolvedValueOnce({
        id: "app-err-1",
        status: "PENDING",
        vacancy: { title: "Desainer Grafis", department: "Kreatif" },
      });

      vi.spyOn(prisma.jobApplication, "update").mockResolvedValueOnce({
        id: "app-err-1",
        fullName: "Deni Suhendar",
        email: "deni@example.com",
        status: "SHORTLISTED",
        vacancy: {
          title: "Desainer Grafis",
          department: "Kreatif",
        },
      });

      const updated = await updateApplicationStatus("app-err-1", "SHORTLISTED");
      expect(updated.status).toBe("SHORTLISTED");
    });
  });
});
