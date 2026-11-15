import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { getDonationByInvoiceId } from "@/services/donationService";
import { verifyDonationOwnership } from "@/lib/requestOwnership";

vi.mock("@/lib/prisma", () => ({
  default: {
    donation: {
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));

vi.mock("@/services/midtransService", () => ({
  checkMidtransOrderStatus: vi.fn().mockResolvedValue({ status: "PAID", isPaid: true }),
}));

vi.mock("@/lib/midtransConfig", () => ({
  getMidtransServerKey: vi.fn().mockReturnValue(""),
}));

describe("Invoice & Kuitansi Security & Ownership Verification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const baseDonation = {
    id: "don-001",
    invoiceId: "INV-20261101-1001-123456",
    accessToken: "a1b2c3d4e5f678901234567890abcdef1234567890abcdef",
    amount: 150000,
    status: "PAID",
    createdAt: new Date("2026-11-01T09:00:00Z"),
    paidAt: new Date("2026-11-01T10:00:00Z"),
    expiredAt: new Date("2026-11-02T10:00:00Z"),
    paymentChannel: "QRIS",
    paymentRef: "QRIS-REF-01",
    donorName: "Burhanuddin Saputra",
    donorEmail: "xburhanuddin3@gmail.com",
    donorPhone: "081214772370",
    campaign: {
      title: "Bimbel PABE Smart",
      slug: "bimbel-pabe-smart",
      category: { name: "Pendidikan" },
    },
  };

  describe("getDonationByInvoiceId Authorization Gate", () => {
    it("mengizinkan akses via valid capability token meskipun tanpa login", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({ ...baseDonation });

      const result = await getDonationByInvoiceId(
        baseDonation.invoiceId,
        baseDonation.accessToken,
        null // Guest / tidak login
      );

      expect(result).not.toBeNull();
      expect(result.isAuthorized).toBe(true);
      expect(result.invoiceId).toBe(baseDonation.invoiceId);
      expect(result.amount).toBe(150000);
    });

    it("mengizinkan akses untuk pemilik donasi yang login via kecocokan Email", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({ ...baseDonation });

      const loggedInOwner = {
        id: "usr-001",
        email: "xburhanuddin3@gmail.com",
        phone: "08999999999", // Nomor HP berbeda, tapi email cocok
        role: "DONOR",
      };

      const result = await getDonationByInvoiceId(
        baseDonation.invoiceId,
        null, // Tanpa token di URL
        loggedInOwner
      );

      expect(result).not.toBeNull();
      expect(result.isAuthorized).toBe(true);
    });

    it("mengizinkan akses untuk pemilik donasi yang login via kecocokan Nomor Telepon WhatsApp (08 vs 62)", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({
        ...baseDonation,
        donorEmail: "anonim@guest.org", // Email donasi berbeda/tamu
        donorPhone: "081214772370",
      });

      // User login menggunakan nomor format internasional 62812...
      const loggedInOwnerByPhone = {
        id: "usr-002",
        email: "burhan.personal@example.com",
        phone: "6281214772370",
        role: "DONOR",
      };

      const result = await getDonationByInvoiceId(
        baseDonation.invoiceId,
        null,
        loggedInOwnerByPhone
      );

      expect(result).not.toBeNull();
      expect(result.isAuthorized).toBe(true);
    });

    it("mengizinkan akses untuk staf internal yayasan (ADMIN/SUPER_ADMIN)", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({ ...baseDonation });

      const staffUser = {
        id: "adm-001",
        email: "admin@payungberkah.org",
        role: "ADMIN",
      };

      const result = await getDonationByInvoiceId(
        baseDonation.invoiceId,
        null,
        staffUser
      );

      expect(result).not.toBeNull();
      expect(result.isAuthorized).toBe(true);
    });

    it("menolak akses (Anti-IDOR) untuk pihak asing tanpa token dan tanpa kecocokan identitas", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({ ...baseDonation });

      const foreignUser = {
        id: "stranger-001",
        email: "stranger@otherdomain.com",
        phone: "085555555555",
        role: "DONOR",
      };

      const result = await getDonationByInvoiceId(
        baseDonation.invoiceId,
        null,
        foreignUser
      );

      expect(result).not.toBeNull();
      expect(result.isAuthorized).toBe(false);
      // Data sensitif donasi tidak boleh diekspos jika tidak terotorisasi
      expect(result.amount).toBeUndefined();
      expect(result.campaign).toBeUndefined();
    });

    it("menolak akses jika token yang diberikan salah/tidak cocok", async () => {
      prisma.donation.findUnique.mockResolvedValueOnce({ ...baseDonation });

      const result = await getDonationByInvoiceId(
        baseDonation.invoiceId,
        "token_palsu_yang_salah_1234567890123456",
        null
      );

      expect(result).not.toBeNull();
      expect(result.isAuthorized).toBe(false);
    });
  });

  describe("verifyDonationOwnership Helper", () => {
    it("memverifikasi kepemilikan donasi via kecocokan nomor telepon 08 vs 62", async () => {
      const outcome = await verifyDonationOwnership({
        donation: {
          invoiceId: "INV-001",
          accessToken: "token12345678901234567890",
          donorEmail: "tamu@example.com",
          donorPhone: "081234567890",
        },
        sessionUser: {
          email: "user_berbeda@example.com",
          phone: "6281234567890",
          role: "DONOR",
        },
      });

      expect(outcome.authorized).toBe(true);
      expect(outcome.isOwner).toBe(true);
    });

    it("menolak kepemilikan jika nomor telepon dan email tidak ada yang cocok", async () => {
      const outcome = await verifyDonationOwnership({
        donation: {
          invoiceId: "INV-001",
          accessToken: "token12345678901234567890",
          donorEmail: "tamu@example.com",
          donorPhone: "081234567890",
        },
        sessionUser: {
          email: "asing@example.com",
          phone: "089876543210",
          role: "DONOR",
        },
      });

      expect(outcome.authorized).toBe(false);
      expect(outcome.isOwner).toBe(false);
    });
  });
});
