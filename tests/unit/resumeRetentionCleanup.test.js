import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { cleanupStaleRejectedResumes } from "@/services/adminStorageService";
import { deleteMultipleFromR2, isR2Configured } from "@/lib/r2Storage";

// Mock R2 Storage
vi.mock("@/lib/r2Storage", () => ({
  listR2Objects: vi.fn(),
  deleteMultipleFromR2: vi.fn().mockResolvedValue({ success: true, deletedCount: 2, errors: [] }),
  isR2Configured: vi.fn().mockReturnValue(true),
}));

// Mock Prisma
vi.mock("@/lib/prisma", () => {
  return {
    default: {
      jobApplication: {
        findMany: vi.fn(),
        updateMany: vi.fn(),
      },
      activityLog: {
        create: vi.fn(),
      },
    },
  };
});

describe("Job Application Resume Retention Cleanup (Storage Lifecycle)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengembalikan 0 jika tidak ada berkas pelamar ditolak yang melampaui masa retensi", async () => {
    prisma.jobApplication.findMany.mockResolvedValueOnce([]);

    const result = await cleanupStaleRejectedResumes({ retentionDays: 90 });

    expect(result.success).toBe(true);
    expect(result.cleanedCount).toBe(0);
    expect(result.deletedKeys).toEqual([]);
    expect(deleteMultipleFromR2).not.toHaveBeenCalled();
    expect(prisma.jobApplication.updateMany).not.toHaveBeenCalled();
  });

  it("menghapus berkas dari Cloudflare R2 dan memperbarui resumeUrl ke null untuk pelamar ditolak > 90 hari", async () => {
    const mockStaleApps = [
      { id: "app-1", resumeUrl: "careers/resumes/job-cv_budi_123.pdf" },
      { id: "app-2", resumeUrl: "careers/resumes/job-cv_siti_456.pdf" },
    ];

    prisma.jobApplication.findMany.mockResolvedValueOnce(mockStaleApps);
    prisma.jobApplication.updateMany.mockResolvedValueOnce({ count: 2 });

    const result = await cleanupStaleRejectedResumes(
      { retentionDays: 90 },
      { userId: "adm-1", userName: "HR Admin" }
    );

    expect(result.success).toBe(true);
    expect(result.cleanedCount).toBe(2);
    expect(result.deletedKeys).toEqual(["careers/resumes/job-cv_budi_123.pdf", "careers/resumes/job-cv_siti_456.pdf"]);

    expect(deleteMultipleFromR2).toHaveBeenCalledWith(["careers/resumes/job-cv_budi_123.pdf", "careers/resumes/job-cv_siti_456.pdf"]);
    expect(prisma.jobApplication.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ["app-1", "app-2"] } },
      data: { resumeUrl: null },
    });

    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "CLEANUP_STALE_RESUMES",
        targetType: "JOB_APPLICATION",
      }),
    });
  });
});
