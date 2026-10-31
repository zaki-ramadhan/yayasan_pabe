import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { getAdminDonors } from "@/services/adminDonorService";

describe("Admin Donor Service - CRM & Real Donor Aggregation", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("hanya menampilkan donatur yang memiliki transaksi donasi berstatus PAID (paidCount > 0)", async () => {
    const mockDonations = [
      {
        id: "don-1",
        invoiceId: "INV-001",
        donorName: "Budi Santoso",
        donorEmail: "budi@example.com",
        donorPhone: "081234567890",
        donorAvatar: null,
        isAnonymous: false,
        totalAmount: 100000,
        paidAt: new Date("2026-10-01T10:00:00Z"),
        createdAt: new Date("2026-10-01T10:00:00Z"),
        campaign: { title: "Sedekah Pangan" },
      },
    ];

    const mockRegisteredUsers = [
      {
        id: "usr-1",
        name: "Budi Santoso",
        email: "budi@example.com",
        phone: "081234567890",
        avatar: "https://r2.pabe.or.id/avatars/budi.webp",
        createdAt: new Date("2026-09-01T10:00:00Z"),
      },
      {
        id: "usr-2",
        name: "Pengguna Baru Belum Donasi",
        email: "belumdonasi@example.com",
        phone: "089999999999",
        avatar: null,
        createdAt: new Date("2026-10-15T10:00:00Z"),
      },
    ];

    vi.spyOn(prisma.donation, "findMany").mockResolvedValue(mockDonations);
    vi.spyOn(prisma.user, "findMany").mockResolvedValue(mockRegisteredUsers);

    const result = await getAdminDonors({ page: 1, limit: 10 });

    // Harus hanya 1 donatur yang masuk, user yang belum pernah donasi harus dieliminasi
    expect(result.items.length).toBe(1);
    expect(result.totalCount).toBe(1);

    const donor = result.items[0];
    expect(donor.name).toBe("Budi Santoso");
    expect(donor.email).toBe("budi@example.com");
    expect(donor.totalPaidAmount).toBe(100000);
    expect(donor.paidCount).toBe(1);
    expect(donor.isRegisteredUser).toBe(true);
    expect(donor.avatar).toBe("https://r2.pabe.or.id/avatars/budi.webp");
  });

  it("berhasil mengakumulasikan donasi berulang dari donatur yang sama", async () => {
    const mockDonations = [
      {
        id: "don-1",
        invoiceId: "INV-001",
        donorName: "Siti Rahma",
        donorEmail: "siti@example.com",
        donorPhone: "081111111111",
        donorAvatar: null,
        isAnonymous: false,
        totalAmount: 50000,
        paidAt: new Date("2026-10-01T10:00:00Z"),
        createdAt: new Date("2026-10-01T10:00:00Z"),
        campaign: { title: "Bantu Yatim" },
      },
      {
        id: "don-2",
        invoiceId: "INV-002",
        donorName: "Siti Rahma",
        donorEmail: "siti@example.com",
        donorPhone: "081111111111",
        donorAvatar: null,
        isAnonymous: false,
        totalAmount: 150000,
        paidAt: new Date("2026-10-10T10:00:00Z"),
        createdAt: new Date("2026-10-10T10:00:00Z"),
        campaign: { title: "Wakaf Quran" },
      },
    ];

    vi.spyOn(prisma.donation, "findMany").mockResolvedValue(mockDonations);
    vi.spyOn(prisma.user, "findMany").mockResolvedValue([]);

    const result = await getAdminDonors({ page: 1, limit: 10 });

    expect(result.items.length).toBe(1);
    const donor = result.items[0];
    expect(donor.name).toBe("Siti Rahma");
    expect(donor.totalPaidAmount).toBe(200000);
    expect(donor.paidCount).toBe(2);
    expect(donor.isRegisteredUser).toBe(false);
  });

  it("mengembalikan array kosong jika sama sekali belum ada donasi yang berstatus PAID", async () => {
    const mockRegisteredUsers = [
      {
        id: "usr-1",
        name: "User Terdaftar 1",
        email: "user1@example.com",
        phone: "081234567891",
        avatar: null,
        createdAt: new Date("2026-10-01T10:00:00Z"),
      },
    ];

    vi.spyOn(prisma.donation, "findMany").mockResolvedValue([]);
    vi.spyOn(prisma.user, "findMany").mockResolvedValue(mockRegisteredUsers);

    const result = await getAdminDonors({ page: 1, limit: 10 });

    expect(result.items.length).toBe(0);
    expect(result.totalCount).toBe(0);
  });
});
