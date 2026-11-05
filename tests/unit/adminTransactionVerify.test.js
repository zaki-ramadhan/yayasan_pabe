import { describe, it, expect, vi, beforeEach } from "vitest";
import prisma from "@/lib/prisma";
import { verifyAdminTransaction } from "@/services/adminTransactionService";
import * as donationService from "@/services/donationService";

describe("Admin Transaction Verification Service (SSOT Audit)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("melempar error jika ID transaksi donasi tidak valid atau kosong", async () => {
    await expect(verifyAdminTransaction("")).rejects.toThrow(/tidak valid/i);
  });

  it("melempar error jika transaksi tidak ditemukan di database", async () => {
    vi.spyOn(prisma.donation, "findFirst").mockResolvedValue(null);

    await expect(verifyAdminTransaction("INV-NONEXISTENT")).rejects.toThrow(/tidak ditemukan/i);
  });

  it("mengembalikan data langsung jika status donasi sudah PAID tanpa memproses ulang (Idempotent)", async () => {
    const existing = {
      id: "don-1",
      invoiceId: "INV-PAID-001",
      status: "PAID",
    };
    vi.spyOn(prisma.donation, "findFirst").mockResolvedValue(existing);
    const settleSpy = vi.spyOn(donationService, "settleDonationStatus");

    const result = await verifyAdminTransaction("INV-PAID-001");
    expect(result).toEqual(existing);
    expect(settleSpy).not.toHaveBeenCalled();
  });

  it("mendelegasikan pelunasan ke settleDonationStatus untuk memproses e-Kwitansi dan broadcast real-time", async () => {
    const pendingDonation = {
      id: "don-pending-1",
      invoiceId: "INV-PENDING-001",
      status: "PENDING",
    };
    vi.spyOn(prisma.donation, "findFirst").mockResolvedValue(pendingDonation);
    const settleSpy = vi.spyOn(donationService, "settleDonationStatus").mockResolvedValue({
      id: "don-pending-1",
      invoiceId: "INV-PENDING-001",
      status: "PAID",
      paidAt: new Date(),
    });

    const result = await verifyAdminTransaction("don-pending-1");
    expect(settleSpy).toHaveBeenCalledWith("INV-PENDING-001", expect.any(Date));
    expect(result.status).toBe("PAID");
  });
});
