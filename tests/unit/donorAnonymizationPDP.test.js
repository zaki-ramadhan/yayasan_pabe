import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { anonymizeDonorAccount } from "@/services/donorProfileService";
import * as r2Storage from "@/lib/r2Storage";

// Mock Prisma
vi.mock("@/lib/prisma", () => {
  const mockUser = {
    findFirst: vi.fn(),
    update: vi.fn(),
  };
  const mockRoutineDonation = {
    updateMany: vi.fn(),
  };
  const mockDonation = {
    updateMany: vi.fn(),
  };
  const mockActivityLog = {
    create: vi.fn(),
  };

  return {
    default: {
      user: mockUser,
      routineDonation: mockRoutineDonation,
      donation: mockDonation,
      activityLog: mockActivityLog,
      $transaction: vi.fn(async (cb) => {
        return cb({
          user: mockUser,
          routineDonation: mockRoutineDonation,
          donation: mockDonation,
          activityLog: mockActivityLog,
        });
      }),
    },
  };
});

// Mock r2Storage
vi.mock("@/lib/r2Storage", () => ({
  deleteFromR2: vi.fn().mockResolvedValue(true),
}));

describe("UU Pelindungan Data Pribadi (UU PDP No. 27/2022) - Donor Account Anonymization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("berhasil menganonimkan akun donatur dan membatalkan komitmen donasi rutin", async () => {
    prisma.user.findFirst.mockResolvedValueOnce({
      id: "usr_donor_pdp_1",
      name: "Budi Santoso",
      email: "budi.santoso@example.com",
      username: "budisantoso",
      role: "DONOR",
      phone: "081234567890",
      customAvatar: "/api/media/users/avatars/budi.webp",
    });

    const result = await anonymizeDonorAccount({
      userId: "usr_donor_pdp_1",
      userEmail: "budi.santoso@example.com",
    });

    expect(result.success).toBe(true);

    // Memverifikasi penghapusan avatar dari Cloudflare R2
    expect(r2Storage.deleteFromR2).toHaveBeenCalledWith("/api/media/users/avatars/budi.webp");

    // Memverifikasi pembatalan donasi rutin aktif
    expect(prisma.routineDonation.updateMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { donorEmail: "budi.santoso@example.com" },
          { donorPhone: "081234567890" },
        ],
        status: { in: ["ACTIVE", "PAUSED"] },
      },
      data: { status: "CANCELLED" },
    });

    // Memverifikasi penyamaran data pada riwayat donasi finansial (SSOT audit ledger)
    expect(prisma.donation.updateMany).toHaveBeenCalledWith({
      where: { donorEmail: "budi.santoso@example.com" },
      data: expect.objectContaining({
        isAnonymous: true,
        donorName: "Hamba Allah",
        donorPhone: null,
        donorAvatar: null,
      }),
    });

    // Memverifikasi penyamaran data pada tabel User
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "usr_donor_pdp_1" },
      data: expect.objectContaining({
        name: "Donatur Anonim (PDP)",
        phone: null,
        isActive: false,
      }),
    });

    // Memverifikasi pencatatan audit log PDP
    expect(prisma.activityLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "PDP_ACCOUNT_ANONYMIZED",
        targetType: "USER",
        targetId: "usr_donor_pdp_1",
      }),
    });
  });

  it("menolak permohonan jika akun adalah staf atau super admin yayasan", async () => {
    prisma.user.findFirst.mockResolvedValueOnce({
      id: "usr_admin_1",
      name: "Admin Utama",
      email: "admin@payungberkah.or.id",
      role: "SUPER_ADMIN",
    });

    await expect(
      anonymizeDonorAccount({ userId: "usr_admin_1" })
    ).rejects.toThrow("Akun pengurus atau staf yayasan tidak dapat dianonimkan secara mandiri.");

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("melempar error jika data pengguna tidak ditemukan di database", async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);

    await expect(
      anonymizeDonorAccount({ userId: "non_existent_id" })
    ).rejects.toThrow("Akun pengguna tidak ditemukan.");
  });

  it("melempar error jika parameter pemanggil kosong", async () => {
    await expect(
      anonymizeDonorAccount({})
    ).rejects.toThrow("Identitas akun wajib disertakan.");
  });
});
