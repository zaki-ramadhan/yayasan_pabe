import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { createAdminVacancy, updateAdminVacancy, getAdminVacancies } from "@/services/adminCareerService";
import { getJobVacancies, getJobVacancyById } from "@/services/careerService";

vi.mock("@/lib/prisma", () => ({
  default: {
    jobVacancy: {
      create: vi.fn(),
      update: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe("Career Vacancy Quota Management", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createAdminVacancy - Quota Handling", () => {
    it("menyimpan kuota yang ditentukan jika input valid", async () => {
      prisma.jobVacancy.create.mockImplementation(async ({ data }) => ({
        id: "vac-1",
        ...data,
      }));

      const result = await createAdminVacancy({
        title: "Staff Pengajar",
        department: "Pendidikan & Dakwah",
        overview: "Mengajar anak asuh binaan",
        quota: 3,
      });

      expect(prisma.jobVacancy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            quota: 3,
          }),
        })
      );
      expect(result.quota).toBe(3);
    });

    it("memvalidasi dan menerapkan fallback quota = 1 jika input tidak valid atau negatif", async () => {
      prisma.jobVacancy.create.mockImplementation(async ({ data }) => ({
        id: "vac-2",
        ...data,
      }));

      await createAdminVacancy({
        title: "Relawan Lapangan",
        department: "Operasional",
        overview: "Aksi tanggap bencana",
        quota: -5,
      });

      expect(prisma.jobVacancy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            quota: 1,
          }),
        })
      );
    });

    it("memparsing kuota dari string angka", async () => {
      prisma.jobVacancy.create.mockImplementation(async ({ data }) => ({
        id: "vac-3",
        ...data,
      }));

      await createAdminVacancy({
        title: "Fundraiser",
        department: "Kemitraan",
        overview: "Membangun kemitraan CSR",
        quota: "5",
      });

      expect(prisma.jobVacancy.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            quota: 5,
          }),
        })
      );
    });
  });

  describe("updateAdminVacancy - Quota Handling", () => {
    it("memperbarui nilai kuota lowongan jika disediakan", async () => {
      prisma.jobVacancy.update.mockImplementation(async ({ data }) => ({
        id: "vac-1",
        ...data,
      }));

      await updateAdminVacancy("vac-1", {
        quota: 4,
      });

      expect(prisma.jobVacancy.update).toHaveBeenCalledWith({
        where: { id: "vac-1" },
        data: { quota: 4 },
      });
    });
  });

  describe("Public Vacancy Queries - Quota Exposure", () => {
    it("mengembalikan kuota lowongan pada getJobVacancies", async () => {
      prisma.jobVacancy.findMany.mockResolvedValueOnce([
        {
          id: "vac-1",
          jobCode: "PABE-001",
          title: "Staff IT",
          department: "IT",
          location: "Jakarta",
          type: "Full-time",
          workplace: "On-site",
          experience: "1 tahun",
          publishedDate: "2026-11-20",
          deadline: "2026-12-01",
          overview: "Mengelola sistem yayasan",
          responsibilities: [],
          requirements: [],
          benefits: [],
          applyUrl: null,
          quota: 2,
          _count: { applications: 5 },
        },
      ]);

      const vacancies = await getJobVacancies();
      expect(vacancies).toHaveLength(1);
      expect(vacancies[0].quota).toBe(2);
    });

    it("mengembalikan kuota lowongan pada getJobVacancyById", async () => {
      prisma.jobVacancy.findFirst.mockResolvedValueOnce({
        id: "vac-1",
        jobCode: "PABE-001",
        title: "Staff IT",
        department: "IT",
        location: "Jakarta",
        type: "Full-time",
        workplace: "On-site",
        experience: "1 tahun",
        publishedDate: "2026-11-20",
        deadline: "2026-12-01",
        overview: "Mengelola sistem yayasan",
        responsibilities: [],
        requirements: [],
        benefits: [],
        applyUrl: null,
        quota: 3,
        _count: { applications: 1 },
      });

      const vacancy = await getJobVacancyById("PABE-001");
      expect(vacancy).not.toBeNull();
      expect(vacancy.quota).toBe(3);
    });
  });
});

