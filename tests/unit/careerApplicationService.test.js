import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { getUserApplications } from "@/services/careerApplicationService";
import { getAdminApplications } from "@/services/adminCareerService";

vi.mock("@/lib/prisma", () => {
  return {
    default: {
      jobApplication: {
        findMany: vi.fn(),
        count: vi.fn(),
      },
    },
  };
});

describe("careerApplicationService - getUserApplications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return empty array if email is invalid or empty", async () => {
    const res1 = await getUserApplications("");
    const res2 = await getUserApplications(null);
    const res3 = await getUserApplications(123);

    expect(res1).toEqual([]);
    expect(res2).toEqual([]);
    expect(res3).toEqual([]);
    expect(prisma.jobApplication.findMany).not.toHaveBeenCalled();
  });

  it("should query prisma with lowercase trimmed email and format output correctly", async () => {
    const mockDbApps = [
      {
        id: "app-1",
        vacancyId: "vac-1",
        fullName: "Burhanuddin",
        email: "xburhanuddin3@gmail.com",
        phone: "081214772370",
        resumeUrl: "/api/media/careers/resumes/cv.pdf",
        portfolioUrl: null,
        linkedinUrl: null,
        coverLetter: "Motivasi kerja saya tinggi.",
        status: "PENDING",
        createdAt: new Date("2026-11-19T06:00:00Z"),
        updatedAt: new Date("2026-11-19T06:00:00Z"),
        vacancy: {
          id: "vac-1",
          jobCode: "JOB-04",
          title: "Fundraiser & Relationship Manager Kemitraan",
          department: "Kemitraan",
          location: "Jakarta Pusat",
          type: "Penuh Waktu",
          workplace: "Fleksibel",
          deadline: "30 November 2026",
        },
      },
    ];

    prisma.jobApplication.findMany.mockResolvedValueOnce(mockDbApps);

    const result = await getUserApplications("  XBurhanuddin3@gmail.COM  ");

    expect(prisma.jobApplication.findMany).toHaveBeenCalledWith({
      where: {
        email: {
          equals: "xburhanuddin3@gmail.com",
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        vacancy: {
          select: {
            id: true,
            jobCode: true,
            title: true,
            department: true,
            location: true,
            type: true,
            workplace: true,
            deadline: true,
          },
        },
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0].position).toBe("Fundraiser & Relationship Manager Kemitraan");
    expect(result[0].vacancyId).toBe("JOB-04");
    expect(result[0].status).toBe("PENDING");
    expect(result[0].resumeUrl).toBe("/api/media/careers/resumes/cv.pdf");
  });

  it("should query NEED_REVIEW status filter with PENDING and REVIEWED statuses", async () => {
    prisma.jobApplication.count.mockResolvedValueOnce(2);
    prisma.jobApplication.findMany.mockResolvedValueOnce([
      {
        id: "app-1",
        vacancyId: "vac-1",
        fullName: "Pelamar Satu",
        email: "satu@example.com",
        phone: "08123456789",
        status: "PENDING",
        createdAt: new Date("2026-11-20T10:00:00Z"),
        vacancy: { id: "vac-1", title: "Admin", department: "Umum" },
      },
      {
        id: "app-2",
        vacancyId: "vac-1",
        fullName: "Pelamar Dua",
        email: "dua@example.com",
        phone: "08123456780",
        status: "REVIEWED",
        createdAt: new Date("2026-11-20T11:00:00Z"),
        vacancy: { id: "vac-1", title: "Admin", department: "Umum" },
      },
    ]);

    const result = await getAdminApplications({
      vacancyId: "vac-1",
      status: "NEED_REVIEW",
    });

    expect(prisma.jobApplication.count).toHaveBeenCalledWith({
      where: {
        vacancyId: "vac-1",
        status: { in: ["PENDING", "REVIEWED"] },
      },
    });

    expect(result.items).toHaveLength(2);
    expect(result.items[0].fullName).toBe("Pelamar Satu");
    expect(result.items[1].fullName).toBe("Pelamar Dua");
  });
});

