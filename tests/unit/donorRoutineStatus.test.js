import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateDonorRoutineDonationStatus } from "@/services/routineDonationService";
import prisma from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  default: {
    routineDonation: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe("updateDonorRoutineDonationStatus Service Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("menolak jika ID donasi rutin tidak disertakan", async () => {
    await expect(
      updateDonorRoutineDonationStatus({ id: "", status: "PAUSED" })
    ).rejects.toThrow("ID donasi rutin wajib disertakan.");
  });

  it("menolak jika parameter status tidak valid", async () => {
    await expect(
      updateDonorRoutineDonationStatus({
        id: "routine-1",
        status: "INVALID_STATUS",
      })
    ).rejects.toThrow("Parameter status donasi rutin tidak valid.");
  });

  it("menolak jika data donasi rutin tidak ditemukan di database (404)", async () => {
    prisma.routineDonation.findUnique.mockResolvedValueOnce(null);

    await expect(
      updateDonorRoutineDonationStatus({
        id: "routine-not-found",
        status: "PAUSED",
        userEmail: "donatur@example.com",
      })
    ).rejects.toThrow("Data donasi rutin tidak ditemukan.");
  });

  it("mencegah serangan IDOR jika email donatur tidak cocok (403)", async () => {
    prisma.routineDonation.findUnique.mockResolvedValueOnce({
      id: "routine-1",
      donorEmail: "owner@example.com",
      status: "ACTIVE",
    });

    await expect(
      updateDonorRoutineDonationStatus({
        id: "routine-1",
        status: "PAUSED",
        userEmail: "intruder@example.com",
      })
    ).rejects.toThrow("Akses tidak sah untuk mengubah data ini.");
  });

  it("berhasil memperbarui status menjadi PAUSED dengan pesan informatif", async () => {
    prisma.routineDonation.findUnique.mockResolvedValueOnce({
      id: "routine-1",
      donorEmail: "donatur@example.com",
      status: "ACTIVE",
    });

    prisma.routineDonation.update.mockResolvedValueOnce({
      id: "routine-1",
      donorEmail: "donatur@example.com",
      status: "PAUSED",
    });

    const result = await updateDonorRoutineDonationStatus({
      id: "routine-1",
      status: "PAUSED",
      userEmail: "donatur@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Donasi rutin berhasil dijeda sementara.");
    expect(result.data.status).toBe("PAUSED");
    expect(prisma.routineDonation.update).toHaveBeenCalledWith({
      where: { id: "routine-1" },
      data: { status: "PAUSED" },
    });
  });

  it("berhasil mengaktifkan kembali status menjadi ACTIVE", async () => {
    prisma.routineDonation.findUnique.mockResolvedValueOnce({
      id: "routine-1",
      donorEmail: "donatur@example.com",
      status: "PAUSED",
    });

    prisma.routineDonation.update.mockResolvedValueOnce({
      id: "routine-1",
      donorEmail: "donatur@example.com",
      status: "ACTIVE",
    });

    const result = await updateDonorRoutineDonationStatus({
      id: "routine-1",
      status: "ACTIVE",
      userEmail: "DONATUR@example.com", // Case-insensitive test
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Donasi rutin berhasil diaktifkan kembali.");
    expect(result.data.status).toBe("ACTIVE");
  });

  it("berhasil membatalkan status menjadi CANCELLED", async () => {
    prisma.routineDonation.findUnique.mockResolvedValueOnce({
      id: "routine-1",
      donorEmail: "donatur@example.com",
      status: "ACTIVE",
    });

    prisma.routineDonation.update.mockResolvedValueOnce({
      id: "routine-1",
      donorEmail: "donatur@example.com",
      status: "CANCELLED",
    });

    const result = await updateDonorRoutineDonationStatus({
      id: "routine-1",
      status: "CANCELLED",
      userEmail: "donatur@example.com",
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Donasi rutin berhasil dibatalkan.");
    expect(result.data.status).toBe("CANCELLED");
  });
});
