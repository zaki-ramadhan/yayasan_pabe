import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateInvoiceId,
  generateInvoiceToken,
  isWeakDeterministicToken,
  verifyInvoiceToken,
} from "@/lib/invoiceAccess";
import { verifyDonationOwnership } from "@/lib/requestOwnership";
import { canAccessAdminPath } from "@/lib/routeAccess";
import { USER_ROLES } from "@/services/authService";

describe("Security Hardening: Invoice Access & Token Entropy (Anti-Enumeration)", () => {
  it("menghasilkan invoiceId dengan format valid dan random suffix CSPRNG", () => {
    const id1 = generateInvoiceId();
    const id2 = generateInvoiceId();

    expect(id1).toMatch(/^INV-\d{8}-\d{4}-\d{6}$/);
    expect(id2).toMatch(/^INV-\d{8}-\d{4}-\d{6}$/);
    expect(id1).not.toBe(id2);
  });

  it("menghasilkan accessToken kriptografis acak (48 hex chars)", () => {
    const token1 = generateInvoiceToken();
    const token2 = generateInvoiceToken();

    expect(token1).toHaveLength(48);
    expect(token2).toHaveLength(48);
    expect(token1).not.toBe(token2);
  });

  it("mendeteksi token deterministik lama yang berasal dari salt rentan hardcoded", () => {
    const invoiceId = "INV-20261112-1234-567890";
    // Token yang dibuat dengan sha256(invoiceId + "_pabe_inv_secure_salt_key").slice(0, 32)
    const crypto = require("crypto");
    const weakToken = crypto
      .createHash("sha256")
      .update(`${invoiceId}_pabe_inv_secure_salt_key`)
      .digest("hex")
      .slice(0, 32);

    expect(isWeakDeterministicToken(invoiceId, weakToken)).toBe(true);

    const safeRandomToken = generateInvoiceToken();
    expect(isWeakDeterministicToken(invoiceId, safeRandomToken)).toBe(false);
  });

  it("memverifikasi token secara timing-safe dan menolak token tidak cocok", () => {
    const token = generateInvoiceToken();
    const mismatched = token.endsWith("0") ? token.slice(0, -1) + "1" : token.slice(0, -1) + "0";
    expect(verifyInvoiceToken(token, token)).toBe(true);
    expect(verifyInvoiceToken(token, mismatched)).toBe(false);
    expect(verifyInvoiceToken("", token)).toBe(false);
    expect(verifyInvoiceToken(null, token)).toBe(false);
  });
});

describe("Security Hardening: Resource Ownership Verification (Anti-IDOR)", () => {
  const mockDonation = {
    id: "don-123",
    invoiceId: "INV-20261112-9999-111222",
    accessToken: "a".repeat(48),
    donorEmail: "budi@example.com",
  };

  it("mengizinkan akses jika token invoice valid disertakan", async () => {
    const result = await verifyDonationOwnership({
      donation: mockDonation,
      providedToken: "a".repeat(48),
    });

    expect(result.authorized).toBe(true);
    expect(result.hasValidToken).toBe(true);
  });

  it("menolak akses jika token salah dan tidak ada sesi", async () => {
    const result = await verifyDonationOwnership({
      donation: mockDonation,
      providedToken: "b".repeat(48),
    });

    expect(result.authorized).toBe(false);
    expect(result.hasValidToken).toBe(false);
  });

  it("menolak token jika yang tersimpan di DB adalah token deterministik lama", async () => {
    const crypto = require("crypto");
    const weakToken = crypto
      .createHash("sha256")
      .update(`${mockDonation.invoiceId}_pabe_inv_secure_salt_key`)
      .digest("hex")
      .slice(0, 32);

    const donationWithWeakToken = {
      ...mockDonation,
      accessToken: weakToken,
    };

    const result = await verifyDonationOwnership({
      donation: donationWithWeakToken,
      providedToken: weakToken,
    });

    // Harus ditolak demi memaksa regenerasi ke token acak
    expect(result.authorized).toBe(false);
  });

  it("mengizinkan akses jika pengguna terautentikasi adalah pemilik email donasi", async () => {
    const result = await verifyDonationOwnership({
      donation: mockDonation,
      providedToken: null,
      sessionUser: { email: "budi@example.com", role: USER_ROLES.DONOR },
    });

    expect(result.authorized).toBe(true);
    expect(result.isOwner).toBe(true);
  });

  it("menolak pengguna donatur lain yang mencoba membuka invoice orang lain tanpa token", async () => {
    const result = await verifyDonationOwnership({
      donation: mockDonation,
      providedToken: null,
      sessionUser: { email: "attacker@example.com", role: USER_ROLES.DONOR },
    });

    expect(result.authorized).toBe(false);
    expect(result.isOwner).toBe(false);
  });

  it("mengizinkan staf yayasan mengakses data donasi untuk administrasi", async () => {
    const result = await verifyDonationOwnership({
      donation: mockDonation,
      providedToken: null,
      sessionUser: { email: "admin@pabe.or.id", role: USER_ROLES.ADMIN },
    });

    expect(result.authorized).toBe(true);
    expect(result.isStaff).toBe(true);
  });
});

describe("Security Hardening: Route Access SSOT (Least Privilege Enforcement)", () => {
  it("membatasi rute pengurus, pengaturan, dan penyimpanan hanya untuk SUPER_ADMIN", () => {
    expect(canAccessAdminPath("/admin/pengguna", "SUPER_ADMIN")).toBe(true);
    expect(canAccessAdminPath("/admin/pengguna", "ADMIN")).toBe(false);
    expect(canAccessAdminPath("/admin/pengaturan", "ADMIN")).toBe(false);
    expect(canAccessAdminPath("/admin/penyimpanan", "FINANCE")).toBe(false);
  });

  it("mengizinkan rute operasional biasa untuk staf ADMIN dan FINANCE", () => {
    expect(canAccessAdminPath("/admin", "ADMIN")).toBe(true);
    expect(canAccessAdminPath("/admin/transaksi", "FINANCE")).toBe(true);
    expect(canAccessAdminPath("/admin/artikel", "ADMIN")).toBe(true);
  });

  it("menolak seluruh rute admin untuk donatur biasa atau unauthenticated", () => {
    expect(canAccessAdminPath("/admin", "DONOR")).toBe(false);
    expect(canAccessAdminPath("/admin/transaksi", null)).toBe(false);
  });
});

