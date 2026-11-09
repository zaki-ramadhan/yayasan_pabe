import { describe, it, expect, vi, beforeEach } from "vitest";
import { deleteAdminUser, createAdminUser, updateAdminUser } from "@/services/adminUserMutationService";
import { USER_ROLES } from "@/services/authService";
import prisma from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    routineDonation: {
      updateMany: vi.fn(),
    },
    $transaction: vi.fn((callback) => callback(prisma)),
  },
}));

vi.mock("@/lib/r2", () => ({
  deleteFromR2: vi.fn(),
}));

describe("Otorisasi & Keamanan Penghapusan Pengurus (deleteAdminUser)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mencegah pengurus menghapus akunnya sendiri (Anti-Self Deletion)", async () => {
    const actorUser = { id: "USR-001", role: USER_ROLES.SUPER_ADMIN };

    await expect(deleteAdminUser("USR-001", actorUser)).rejects.toThrow(
      "Anda tidak dapat menghapus akun Anda sendiri."
    );
  });

  it("mencegah penghapusan jika ID pengurus kosong", async () => {
    const actorUser = { id: "USR-001", role: USER_ROLES.SUPER_ADMIN };

    await expect(deleteAdminUser("", actorUser)).rejects.toThrow(
      "ID pengurus tidak valid."
    );
  });

  it("menolak penghapusan jika pengurus tidak ditemukan di basis data", async () => {
    const actorUser = { id: "USR-001", role: USER_ROLES.SUPER_ADMIN };
    prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(deleteAdminUser("USR-999", actorUser)).rejects.toThrow(
      "Data pengurus tidak ditemukan."
    );
  });

  it("mencegah penghapusan Super Admin terakhir dari sistem", async () => {
    const actorUser = { id: "USR-001", role: USER_ROLES.SUPER_ADMIN };
    prisma.user.findUnique.mockResolvedValueOnce({
      id: "USR-002",
      role: USER_ROLES.SUPER_ADMIN,
    });
    prisma.user.count.mockResolvedValueOnce(1); // Hanya ada 1 Super Admin

    await expect(deleteAdminUser("USR-002", actorUser)).rejects.toThrow(
      "Tidak dapat menghapus Super Admin terakhir."
    );
  });

  it("menolak pembuatan akun Super Admin jika bukan dilakukan oleh developer/pemilik sistem", async () => {
    const nonDevUser = { id: "USR-002", email: "admin.biasa@pabe.or.id", role: USER_ROLES.SUPER_ADMIN };

    await expect(
      createAdminUser(
        {
          name: "Calon Super Admin",
          email: "calon@pabe.or.id",
          role: USER_ROLES.SUPER_ADMIN,
          title: "Direktur",
          hasLoginAccess: true,
          password: "password123",
        },
        nonDevUser
      )
    ).rejects.toThrow("Hanya Developer / Pemilik Sistem yang berwenang memberikan hak akses Super Admin.");
  });

  it("menolak pengubahan role ke Super Admin jika bukan dilakukan oleh developer/pemilik sistem", async () => {
    const nonDevUser = { id: "USR-002", email: "admin.biasa@pabe.or.id", role: USER_ROLES.SUPER_ADMIN };
    prisma.user.findUnique.mockResolvedValueOnce({
      id: "USR-003",
      email: "staf@pabe.or.id",
      role: USER_ROLES.ADMIN,
    });

    await expect(
      updateAdminUser(
        "USR-003",
        {
          role: USER_ROLES.SUPER_ADMIN,
        },
        nonDevUser
      )
    ).rejects.toThrow("Hanya Developer / Pemilik Sistem yang berwenang menaikkan hak akses menjadi Super Admin.");
  });
});

