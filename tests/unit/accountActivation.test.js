import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createActivationToken,
  verifyActivationToken,
  resendActivationWorkflow,
} from "@/services/accountActivationService";
import {
  buildAccountActivationEmailHtml,
  ACCOUNT_ACTIVATION_EMAIL_SUBJECT,
} from "@/templates/emails/accountActivationEmailTemplate";

describe("Account Activation & Anti-Ghost User Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Template Email Aktivasi Akun (Postman Style + 3D Blue Button)", () => {
    it("menghasilkan markup HTML yang memuat tautan aktivasi dan nama pengguna", () => {
      const html = buildAccountActivationEmailHtml({
        name: "Budi Santoso",
        activationUrl: "https://pabe.or.id/api/auth/verify-email?token=token_aktivasi_123",
      });

      expect(ACCOUNT_ACTIVATION_EMAIL_SUBJECT).toBe("Aktivasi Akun Donatur Anda - Yayasan PABE");
      expect(html).toContain("Budi Santoso");
      expect(html).toContain("https://pabe.or.id/api/auth/verify-email?token=token_aktivasi_123");
      expect(html).toContain("Aktifkan Akun Saya");
      expect(html).toContain("logo-ypabe.png");
    });
  });

  describe("Validasi Token Aktivasi Akun", () => {
    it("menolak token kosong atau string pendek", async () => {
      const res = await verifyActivationToken("");
      expect(res.success).toBe(false);
      expect(res.message).toBe("Tautan aktivasi tidak valid.");
    });

    it("menolak token fiktif yang tidak ada di database", async () => {
      const res = await verifyActivationToken("fiktif_token_rahasia_1234567890");
      expect(res.success).toBe(false);
      expect(res.message).toContain("tidak ditemukan atau sudah pernah digunakan");
    });

    it("menolak kirim ulang aktivasi dengan email kosong", async () => {
      await expect(resendActivationWorkflow("")).rejects.toThrow("Alamat email wajib diisi.");
    });
  });

  describe("Kebijakan Kuota Harian Kirim Ulang Aktivasi (Anti-Flooding)", () => {
    it("memiliki kebijakan 3 kali per 24 jam", async () => {
      const { ACCOUNT_ACTIVATION_POLICY } = await import("@/services/accountActivationService");
      expect(ACCOUNT_ACTIVATION_POLICY.DAILY_RESEND_LIMIT).toBe(3);
      expect(ACCOUNT_ACTIVATION_POLICY.WINDOW_MS).toBe(24 * 60 * 60 * 1000);
      expect(ACCOUNT_ACTIVATION_POLICY.TOKEN_EXPIRY_HOURS).toBe(24);
    });

    it("membatasi permintaan kirim ulang aktivasi ke-4 pada email yang sama dalam 24 jam", async () => {
      const {
        checkDailyActivationResendLimit,
        rollbackDailyActivationResendLimit,
      } = await import("@/services/accountActivationService");
      const { globalRateLimiter } = await import("@/lib/rateLimit");

      const testEmail = "donor.activation.daily.limit@example.com";
      globalRateLimiter.reset(`auth_resend_activation_daily:${testEmail}`);

      // Percobaan 1, 2, 3 diizinkan
      const res1 = checkDailyActivationResendLimit(testEmail);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = checkDailyActivationResendLimit(testEmail);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = checkDailyActivationResendLimit(testEmail);
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);

      // Percobaan 4 ditolak
      const res4 = checkDailyActivationResendLimit(testEmail);
      expect(res4.success).toBe(false);
      expect(res4.remaining).toBe(0);
      expect(res4.resetMs).toBeGreaterThan(0);

      // Rollback satu kuota
      rollbackDailyActivationResendLimit(testEmail);
      const resAfterRollback = checkDailyActivationResendLimit(testEmail);
      expect(resAfterRollback.success).toBe(true);

      globalRateLimiter.reset(`auth_resend_activation_daily:${testEmail}`);
    });
  });
});

