import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { deleteAdminVacancy, deleteAdminVacanciesBatch } from "@/services/adminCareerService";
import { deleteMultipleFromR2 } from "@/lib/r2Storage";

vi.mock("@/lib/r2Storage", () => ({
  deleteMultipleFromR2: vi.fn().mockResolvedValue({ success: true, deletedCount: 2 }),
  deleteFromR2: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/prisma", () => {
  return {
    default: {
      jobVacancy: {
        delete: vi.fn().mockResolvedValue({ id: "vac-1" }),
        deleteMany: vi.fn().mockResolvedValue({ count: 2 }),
      },
      jobApplication: {
        findMany: vi.fn(),
      },
    },
  };
});

describe("Admin Career Deletion & Storage Hygiene (Anti-Orphaned Resumes)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("membersihkan berkas resume dari Cloudflare R2 saat satu lowongan dihapus", async () => {
    prisma.jobApplication.findMany.mockResolvedValueOnce([
      { resumeUrl: "careers/resumes/cv_ahmad_01.pdf" },
      { resumeUrl: "careers/resumes/cv_fatimah_02.pdf" },
    ]);

    const result = await deleteAdminVacancy("vac-1");

    expect(result).toEqual({ id: "vac-1" });
    expect(deleteMultipleFromR2).toHaveBeenCalledWith([
      "careers/resumes/cv_ahmad_01.pdf",
      "careers/resumes/cv_fatimah_02.pdf",
    ]);
    expect(prisma.jobVacancy.delete).toHaveBeenCalledWith({ where: { id: "vac-1" } });
  });

  it("tidak memanggil deleteMultipleFromR2 jika pelamar tidak memiliki berkas resume", async () => {
    prisma.jobApplication.findMany.mockResolvedValueOnce([]);

    await deleteAdminVacancy("vac-empty");

    expect(deleteMultipleFromR2).not.toHaveBeenCalled();
    expect(prisma.jobVacancy.delete).toHaveBeenCalledWith({ where: { id: "vac-empty" } });
  });

  it("membersihkan berkas resume dari seluruh lowongan saat batch delete", async () => {
    prisma.jobApplication.findMany.mockResolvedValueOnce([
      { resumeUrl: "careers/resumes/cv_budi_batch.pdf" },
    ]);

    const result = await deleteAdminVacanciesBatch(["vac-1", "vac-2"]);

    expect(result).toEqual({ count: 2 });
    expect(deleteMultipleFromR2).toHaveBeenCalledWith(["careers/resumes/cv_budi_batch.pdf"]);
    expect(prisma.jobVacancy.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["vac-1", "vac-2"] } },
    });
  });
});

