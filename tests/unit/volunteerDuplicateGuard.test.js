import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerVolunteer } from "@/services/volunteerService";
import prisma from "@/lib/prisma";

describe("Volunteer Duplicate Registration Guard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("menolak pendaftaran jika email atau nomor WhatsApp sudah ada dengan status PENDING", async () => {
    vi.spyOn(prisma.volunteer, "findFirst").mockResolvedValueOnce({
      id: "vol-existing-1",
      fullName: "Burhanuddin",
      email: "burhanuddin@example.com",
      phone: "081234567890",
      status: "PENDING",
    });

    await expect(
      registerVolunteer({
        fullName: "Burhanuddin",
        email: "burhanuddin@example.com",
        phone: "081234567890",
        city: "Kab. Cirebon",
      })
    ).rejects.toThrow(/sudah diajukan dan sedang dalam proses pemeriksaan/i);
  });

  it("menolak pendaftaran jika email atau nomor WhatsApp sudah terdaftar sebagai relawan APPROVED", async () => {
    vi.spyOn(prisma.volunteer, "findFirst").mockResolvedValueOnce({
      id: "vol-active-1",
      fullName: "Burhanuddin",
      email: "burhanuddin@example.com",
      phone: "081234567890",
      status: "APPROVED",
    });

    await expect(
      registerVolunteer({
        fullName: "Burhanuddin",
        email: "burhanuddin@example.com",
        phone: "081234567890",
        city: "Kab. Cirebon",
      })
    ).rejects.toThrow(/sudah terdaftar sebagai relawan aktif/i);
  });

  it("memperbarui pengajuan lama jika status sebelumnya REJECTED tanpa membuat baris duplikat", async () => {
    vi.spyOn(prisma.volunteer, "findFirst").mockResolvedValueOnce({
      id: "vol-rejected-1",
      fullName: "Burhanuddin",
      email: "burhanuddin@example.com",
      phone: "081234567890",
      status: "REJECTED",
    });

    const updateSpy = vi.spyOn(prisma.volunteer, "update").mockResolvedValueOnce({
      id: "vol-rejected-1",
      fullName: "Burhanuddin",
      email: "burhanuddin@example.com",
      phone: "081234567890",
      city: "Kab. Cirebon",
      status: "PENDING",
    });

    const result = await registerVolunteer({
      fullName: "Burhanuddin",
      email: "burhanuddin@example.com",
      phone: "081234567890",
      city: "Kab. Cirebon",
    });

    expect(result.success).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "vol-rejected-1" },
        data: expect.objectContaining({
          status: "PENDING",
        }),
      })
    );
  });
});

