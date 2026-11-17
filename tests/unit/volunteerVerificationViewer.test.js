import { describe, it, expect, vi, beforeEach } from "vitest";
import { getVolunteerPublicProfile } from "@/services/volunteerVerificationService";
import prisma from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  default: {
    volunteer: {
      findUnique: vi.fn(),
    },
    user: {
      findFirst: vi.fn(),
    },
  },
}));

describe("volunteerVerificationService - Security & Data Protection (UU PDP)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mengembalikan null secara aman jika ID tidak ditemukan atau kosong", async () => {
    const resEmpty = await getVolunteerPublicProfile("");
    expect(resEmpty).toBeNull();

    prisma.volunteer.findUnique.mockResolvedValueOnce(null);
    const resNotFound = await getVolunteerPublicProfile("non-existent-id");
    expect(resNotFound).toBeNull();
  });

  it("tidak membocorkan data sensitif donatur/relawan (tanpa email, tanpa nomor telepon pribadi)", async () => {
    const mockVolunteer = {
      id: "vol-secret-123",
      fullName: "Ahmad Mujahid",
      email: "ahmad.rahasia@example.com",
      phone: "081299998888",
      city: "Jakarta Timur",
      interest: "Relawan Pendidikan",
      status: "APPROVED",
      createdAt: new Date("2026-03-01T10:00:00.000Z"),
    };

    prisma.volunteer.findUnique.mockResolvedValueOnce(mockVolunteer);
    prisma.user.findFirst.mockResolvedValueOnce({
      avatar: "/img/avatars/avatar-1.webp",
      customAvatar: null,
      providerAvatar: null,
    });

    const result = await getVolunteerPublicProfile("vol-secret-123");

    expect(result).not.toBeNull();
    expect(result.id).toBe("vol-secret-123");
    expect(result.fullName).toBe("Ahmad Mujahid");
    expect(result.isApproved).toBe(true);
    expect(result.city).toBe("Jakarta Timur");
    expect(result.avatarUrl).toBe("/img/avatars/avatar-1.webp");

    expect(result.email).toBeUndefined();
    expect(result.phone).toBeUndefined();
  });

  it("menandai isApproved false jika status relawan bukan APPROVED (PENDING / REJECTED)", async () => {
    const mockPendingVolunteer = {
      id: "vol-pending-456",
      fullName: "Budi Santoso",
      email: "budi@example.com",
      phone: "081211112222",
      city: "Bekasi",
      status: "PENDING",
      createdAt: new Date("2026-03-01T10:00:00.000Z"),
    };

    prisma.volunteer.findUnique.mockResolvedValueOnce(mockPendingVolunteer);
    prisma.user.findFirst.mockResolvedValueOnce(null);

    const result = await getVolunteerPublicProfile("vol-pending-456");

    expect(result).not.toBeNull();
    expect(result.status).toBe("PENDING");
    expect(result.isApproved).toBe(false);
  });

  it("membuat URL validasi publik relawan secara deterministik dari base URL", () => {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://payungberkah.id").replace(/\/+$/, "");
    const volunteerId = "vol-test-123";
    const expectedUrl = `${baseUrl}/relawan/validasi/${volunteerId}`;
    expect(expectedUrl).toContain("/relawan/validasi/vol-test-123");
  });
});

