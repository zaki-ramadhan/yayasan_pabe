import { describe, it, expect } from "vitest";
import { createRoutineDonations } from "@/services/routineDonationService";
import { POST as routineDonationPost } from "@/app/api/routine-donations/route";
import { POST as aminPost } from "@/app/api/donations/amin/route";
import prisma from "@/lib/prisma";

describe("Backend Integration & Real Persistence Audit", () => {
  describe("Donasi Rutin (PostgreSQL & Service Integration)", () => {
    beforeEach(async () => {
      await prisma.routineDonation.deleteMany({
        where: {
          donorEmail: {
            in: [
              "ahmad.subari@gmail.com",
              "nurul.hidayah@gmail.com",
              "donatur.api@gmail.com",
              "fajar@gmail.com",
            ],
          },
        },
      });
    });

    it("berhasil memvalidasi dan memproses komitmen donasi rutin", async () => {
      const payload = {
        donorName: "Haji Ahmad Subari",
        donorPhone: "081234567890",
        donorEmail: "ahmad.subari@gmail.com",
        isAnonymous: false,
        programs: [
          {
            campaignId: "camp-001",
            programTitle: "Beasiswa Anak Yatim Tahfidz",
            amount: 50000,
            frequency: "WEEKLY",
            routineType: "AUTO_DONATION",
            selectedDay: "jumat",
            reminderTime: "05:00",
          },
        ],
      };

      const result = await createRoutineDonations(payload);
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].amount).toBe(50000);
      expect(result.data[0].frequency).toBe("WEEKLY");
    });

    it("menolak pendaftaran jika donatur sudah memiliki jadwal donasi rutin aktif", async () => {
      const payload = {
        donorName: "Haji Ahmad Subari",
        donorPhone: "081234567890",
        donorEmail: "ahmad.subari@gmail.com",
        isAnonymous: false,
        programs: [
          {
            campaignId: "camp-001",
            programTitle: "Beasiswa Anak Yatim Tahfidz",
            amount: 50000,
            frequency: "WEEKLY",
            routineType: "AUTO_DONATION",
          },
        ],
      };

      await createRoutineDonations(payload);
      await expect(createRoutineDonations(payload)).rejects.toThrow(/sudah memiliki jadwal/i);
    });

    it("berhasil menyimpan masa berlaku rentang tanggal kustom", async () => {
      const payload = {
        donorName: "Haji Ahmad Subari",
        donorEmail: "ahmad.subari@gmail.com",
        programs: [
          {
            campaignId: "camp-001",
            programTitle: "Program Terjadwal",
            amount: 50000,
            frequency: "WEEKLY",
            routineType: "AUTO_DONATION",
            hasCustomPeriod: true,
            startDate: new Date("2026-11-01").toISOString(),
            endDate: new Date("2026-12-01").toISOString(),
          },
        ],
      };

      const result = await createRoutineDonations(payload);
      expect(result.data[0].hasCustomPeriod).toBe(true);
      expect(result.data[0].startDate).toBeDefined();
      expect(result.data[0].endDate).toBeDefined();
    });

    it("menolak komitmen jika nominal di bawah batas minimum Rp 10.000", async () => {
      const payload = {
        donorName: "Fajar",
        donorPhone: "081234567890",
        donorEmail: "fajar@gmail.com",
        programs: [
          {
            programTitle: "Program Uji",
            amount: 5000,
            routineType: "AUTO_DONATION",
          },
        ],
      };

      await expect(createRoutineDonations(payload)).rejects.toThrow(/minimal/i);
    });

    it("menolak jika nama kosong dan bukan anonim", async () => {
      const payload = {
        donorName: "",
        donorPhone: "081234567890",
        donorEmail: "fajar@gmail.com",
        isAnonymous: false,
        programs: [{ programTitle: "Uji", amount: 25000 }],
      };

      await expect(createRoutineDonations(payload)).rejects.toThrow(/nama/i);
    });

    it("berhasil mendaftarkan komitmen donasi rutin tanpa nomor telepon (berpusat email)", async () => {
      const payload = {
        donorName: "Ibu Nurul Hidayah",
        donorEmail: "nurul.hidayah@gmail.com",
        isAnonymous: false,
        programs: [
          {
            campaignId: "camp-001",
            programTitle: "Program Kebaikan Subuh",
            amount: 25000,
            frequency: "WEEKLY",
            routineType: "AUTO_DONATION",
            selectedDay: "jumat",
          },
        ],
      };

      const result = await createRoutineDonations(payload);
      expect(result.success).toBe(true);
      expect(result.data.length).toBe(1);
      expect(result.data[0].amount).toBe(25000);
    });

    it("endpoint /api/routine-donations mengembalikan status 201 dengan envelope terstandar", async () => {
      const req = new Request("http://localhost:3000/api/routine-donations", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.101" },
        body: JSON.stringify({
          donorName: "Donatur API Test",
          donorPhone: "081987654321",
          donorEmail: "donatur.api@gmail.com",
          isAnonymous: true,
          programs: [
            {
              programTitle: "Sedekah Subuh Rutin",
              amount: 25000,
              frequency: "DAILY",
              routineType: "AUTO_DONATION",
            },
          ],
        }),
      });

      const res = await routineDonationPost(req);
      const json = await res.json();
      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.length).toBe(1);
    });
  });

  describe("Sistem Aamiin Doa Real-Time (Backend Route Audit)", () => {
    it("menolak permintaan /api/donations/amin jika donationId tidak disertakan", async () => {
      const req = new Request("http://localhost:3000/api/donations/amin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.102" },
        body: JSON.stringify({}),
      });

      const res = await aminPost(req);
      const json = await res.json();
      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
      expect(json.message).toContain("ID donasi");
    });

    it("berhasil menerima permintaan penambahan aamiin doa dengan aman", async () => {
      const sampleDonation = await prisma.donation.findFirst({ select: { id: true } });
      const targetId = sampleDonation?.id || "don-001";

      const req = new Request("http://localhost:3000/api/donations/amin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.103" },
        body: JSON.stringify({
          donationId: targetId,
          action: "increment",
        }),
      });

      const res = await aminPost(req);
      const json = await res.json();
      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe(targetId);
    });
  });

  describe("Sistem Peluang Karier & Rekrutmen (PostgreSQL & Service Integration)", () => {
    it("berhasil memuat daftar lowongan pekerjaan aktif", async () => {
      const { getJobVacancies } = await import("@/services/careerService");
      const vacancies = await getJobVacancies();
      expect(Array.isArray(vacancies)).toBe(true);
      expect(vacancies.length).toBeGreaterThan(0);
      expect(vacancies[0]).toHaveProperty("title");
      expect(vacancies[0]).toHaveProperty("department");
    });

    it("menolak pengiriman lamaran kerja jika nama atau email tidak valid", async () => {
      const { submitJobApplication } = await import("@/services/careerService");
      await expect(
        submitJobApplication({
          vacancyId: "JOB-01",
          fullName: "A",
          email: "invalid-email",
          phone: "081234567890",
          coverLetter: "Saya sangat tertarik",
        })
      ).rejects.toThrow(/nama/i);
    });

    it("menolak pengiriman lamaran kerja jika nomor telepon kurang dari 10 digit", async () => {
      const { submitJobApplication } = await import("@/services/careerService");
      await expect(
        submitJobApplication({
          vacancyId: "JOB-01",
          fullName: "Fulan bin Fulan",
          email: "fulan@example.com",
          phone: "08123",
          coverLetter: "Saya sangat tertarik bergabung bersama yayasan",
        })
      ).rejects.toThrow(/(?:whatsapp|telepon)/i);
    });

    it("menolak submit lamaran jika posisi mewajibkan berkas CV tetapi berkas kosong", async () => {
      const { submitJobApplication } = await import("@/services/careerService");
      await expect(
        submitJobApplication({
          vacancyId: "JOB-01",
          fullName: "Fulan bin Fulan",
          email: "fulan@example.com",
          phone: "081234567890",
          coverLetter: "Saya sangat tertarik bergabung bersama yayasan",
          resumeUrl: "",
        })
      ).rejects.toThrow(/berkas cv/i);
    });

    it("mengizinkan submit lamaran tanpa berkas CV jika posisi tidak mewajibkan berkas", async () => {
      const { submitJobApplication } = await import("@/services/careerService");
      const app = await submitJobApplication({
        vacancyId: "JOB-03",
        fullName: "Kreator Konten Handal",
        email: "kreator@example.com",
        phone: "081234567890",
        coverLetter: "Saya memiliki portofolio video dakwah dan bersedia berkhidmat.",
        resumeUrl: "",
      });
      expect(app).toBeDefined();
      expect(app.data.fullName).toBe("Kreator Konten Handal");
    });

    it("berhasil memproses submit lamaran kerja valid via API /api/careers/apply", async () => {
      const { POST: careersApplyPost } = await import("@/app/api/careers/apply/route");
      const req = new Request("http://localhost:3000/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-forwarded-for": "192.168.1.104" },
        body: JSON.stringify({
          vacancyId: "JOB-01",
          fullName: "Ahmad Zaki Ramadhan",
          email: "zaki.applicant@example.com",
          phone: "081234567890",
          resumeUrl: "https://drive.google.com/file/d/test-cv/view",
          coverLetter: "Bismillah, saya memiliki pengalaman 2 tahun di bidang logistik kemanusiaan dan siap berkontribusi.",
        }),
      });

      const res = await careersApplyPost(req);
      const json = await res.json();
      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.fullName).toBe("Ahmad Zaki Ramadhan");
    });
  });

  describe("Bulk Campaign Operations (Guarded Delete)", () => {

    it("menolak penghapusan massal jika salah satu program memiliki riwayat donasi", async () => {
      const { deleteAdminCampaignsBulk } = await import("@/services/adminCampaignService");
      vi.spyOn(prisma.campaign, "findMany").mockResolvedValueOnce([
        { id: "camp-1", title: "Beasiswa Yatim", collectedAmount: 500000 },
      ]);

      await expect(
        deleteAdminCampaignsBulk(["camp-1", "camp-2"])
      ).rejects.toThrow(/telah memiliki riwayat donasi masuk/i);
    });

    it("berhasil menghapus massal program jika seluruhnya belum memiliki donasi", async () => {
      const { deleteAdminCampaignsBulk } = await import("@/services/adminCampaignService");
      vi.spyOn(prisma.campaign, "findMany")
        .mockResolvedValueOnce([]) // cek donasi: kosong
        .mockResolvedValueOnce([{ id: "camp-draft-1", bannerUrl: null, categoryId: "cat-1" }]); // cek banner: kosong

      const deleteManySpy = vi
        .spyOn(prisma.campaign, "deleteMany")
        .mockResolvedValue({ count: 1 });

      const result = await deleteAdminCampaignsBulk(["camp-draft-1"]);
      expect(deleteManySpy).toHaveBeenCalledWith({
        where: { id: { in: ["camp-draft-1"] } },
      });
      expect(result.count).toBe(1);
    });
  });
});


