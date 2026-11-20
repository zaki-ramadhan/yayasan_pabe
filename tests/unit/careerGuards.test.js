import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { submitJobApplication, cancelUserJobApplication } from "@/services/careerService";

vi.mock("@/lib/serverDnsValidator", () => ({
  verifyEmailDomainDns: vi.fn().mockResolvedValue({ isValid: true, sanitized: "pelamar@example.com" }),
}));

vi.mock("@/services/emailService", () => ({
  sendCareerApplicationEmail: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/sseBroadcast", () => ({
  broadcastAdminEvent: vi.fn(),
}));

vi.mock("@/lib/prisma", () => {
  return {
    default: {
      jobVacancy: {
        findFirst: vi.fn(),
      },
      jobApplication: {
        findFirst: vi.fn(),
        count: vi.fn(),
        create: vi.fn(),
        delete: vi.fn(),
      },
      user: {
        findFirst: vi.fn(),
        update: vi.fn(),
      },
    },
  };
});

describe("Career Business Guards & Anti-Double Job Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const basePayload = {
    vacancyId: "JOB-01",
    fullName: "Budi Santoso",
    email: "pelamar@example.com",
    phone: "081234567890",
    coverLetter: "Saya ingin berkontribusi di divisi sosial kemanusiaan.",
    resumeUrl: "/api/media/careers/resumes/cv.pdf",
  };

  it("menolak lamaran jika akun sudah berstatus ACCEPTED (Anti-Double Job)", async () => {
    prisma.jobVacancy.findFirst.mockResolvedValueOnce({
      id: "vac-01",
      jobCode: "JOB-01",
      title: "Staff Divisi Program",
      applyUrl: null,
    });

    prisma.jobApplication.findFirst.mockResolvedValueOnce({
      id: "app-accepted-1",
      status: "ACCEPTED",
      vacancy: { title: "Staff Keuangan" },
    });

    await expect(submitJobApplication(basePayload)).rejects.toThrow(
      /terikat kontrak kerja aktif/i
    );
  });

  it("menolak lamaran jika akun adalah staf internal yayasan aktif", async () => {
    prisma.jobVacancy.findFirst.mockResolvedValueOnce({
      id: "vac-01",
      jobCode: "JOB-01",
      title: "Staff Divisi Program",
      applyUrl: null,
    });

    // Guard 1: acceptedApp null
    prisma.jobApplication.findFirst.mockResolvedValueOnce(null);
    // User role is ADMIN
    prisma.user.findFirst.mockResolvedValueOnce({ role: "ADMIN" });

    await expect(submitJobApplication(basePayload)).rejects.toThrow(
      /staf internal yayasan tidak diperkenankan/i
    );
  });

  it("menolak lamaran ganda jika pelamar sudah memiliki berkas aktif di posisi yang sama (Anti-Duplicate)", async () => {
    prisma.jobVacancy.findFirst.mockResolvedValueOnce({
      id: "vac-01",
      jobCode: "JOB-01",
      title: "Staff Divisi Program",
      applyUrl: null,
    });

    // Guard 1: acceptedApp null, user null
    prisma.jobApplication.findFirst
      .mockResolvedValueOnce(null) // acceptedApp
      .mockResolvedValueOnce({ id: "app-existing", status: "PENDING" }); // duplicateActive
    prisma.user.findFirst.mockResolvedValueOnce(null);

    await expect(submitJobApplication(basePayload)).rejects.toThrow(
      /masih dalam proses seleksi/i
    );
  });

  it("menolak lamaran jika pelamar telah mencapai kuota maksimal 2 lamaran aktif", async () => {
    prisma.jobVacancy.findFirst.mockResolvedValueOnce({
      id: "vac-01",
      jobCode: "JOB-01",
      title: "Staff Divisi Program",
      applyUrl: null,
    });

    prisma.jobApplication.findFirst
      .mockResolvedValueOnce(null) // acceptedApp
      .mockResolvedValueOnce(null); // duplicateActive
    prisma.user.findFirst.mockResolvedValueOnce(null);

    // Guard 3: active count is 2
    prisma.jobApplication.count.mockResolvedValueOnce(2);

    await expect(submitJobApplication(basePayload)).rejects.toThrow(
      /batas maksimal 2 lamaran aktif/i
    );
  });

  it("berhasil membatalkan lamaran jika status masih PENDING", async () => {
    prisma.jobApplication.findFirst.mockResolvedValueOnce({
      id: "app-cancel-1",
      email: "pelamar@example.com",
      status: "PENDING",
      vacancyId: "vac-01",
      vacancy: { id: "vac-01", title: "Staff Program" },
    });
    prisma.jobApplication.delete.mockResolvedValueOnce({ id: "app-cancel-1" });

    const result = await cancelUserJobApplication("app-cancel-1", "pelamar@example.com");

    expect(result.success).toBe(true);
    expect(prisma.jobApplication.delete).toHaveBeenCalledWith({
      where: { id: "app-cancel-1" },
    });
  });

  it("menolak pembatalan jika lamaran sudah dalam status REVIEWED / SHORTLISTED", async () => {
    prisma.jobApplication.findFirst.mockResolvedValueOnce({
      id: "app-cancel-2",
      email: "pelamar@example.com",
      status: "SHORTLISTED",
      vacancyId: "vac-01",
      vacancy: { id: "vac-01", title: "Staff Program" },
    });

    await expect(
      cancelUserJobApplication("app-cancel-2", "pelamar@example.com")
    ).rejects.toThrow(/telah ditinjau tidak dapat dibatalkan/i);
    expect(prisma.jobApplication.delete).not.toHaveBeenCalled();
  });
});

