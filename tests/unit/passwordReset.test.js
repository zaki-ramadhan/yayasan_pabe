import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  requestPasswordReset,
  verifyPasswordResetToken,
  resetPasswordWithToken,
} from "@/services/passwordResetService";
import { verifyEmailDomainDns } from "@/lib/serverDnsValidator";
import prisma from "@/lib/prisma";

describe("Password Reset & Email Security", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Penyaring Disposable Email & Role Account", () => {
    it("menolak email dengan domain sementara/disposable", async () => {
      const res = await verifyEmailDomainDns("budi@yopmail.com", {
        isRequired: true,
        allowDisposable: false,
      });

      expect(res.isValid).toBe(false);
      expect(res.message).toBe("Email sementara tidak diizinkan. Gunakan email pribadi Anda.");
    });

    it("menolak email dengan domain tempmail", async () => {
      const res = await verifyEmailDomainDns("user@tempmail.com", {
        isRequired: true,
        allowDisposable: false,
      });

      expect(res.isValid).toBe(false);
      expect(res.message).toBe("Email sementara tidak diizinkan. Gunakan email pribadi Anda.");
    });

    it("menolak email peran (role-based) jika allowRole bernilai false", async () => {
      const res = await verifyEmailDomainDns("admin@gmail.com", {
        isRequired: true,
        allowRole: false,
      });

      expect(res.isValid).toBe(false);
      expect(res.message).toBe("Gunakan email pribadi, bukan email kantor/umum.");
    });

    it("mengizinkan email personal terpercaya (Gmail/Yahoo)", async () => {
      const res = await verifyEmailDomainDns("donatur.pabe@gmail.com", {
        isRequired: true,
        allowDisposable: false,
        allowRole: false,
      });

      expect(res.isValid).toBe(true);
    });
  });

  describe("Password Reset Service Workflow", () => {
    it("menolak permintaan reset dengan email kosong", async () => {
      await expect(requestPasswordReset("")).rejects.toThrow("Alamat email wajib diisi.");
    });

    it("mengembalikan respon generik jika email tidak terdaftar (anti-enumeration)", async () => {
      const res = await requestPasswordReset("tidak_ada_di_db_9999@gmail.com");
      expect(res.success).toBe(true);
      expect(res.message).toContain("Jika email Anda terdaftar");
    });

    it("menolak token yang tidak ditemukan di database", async () => {
      const res = await verifyPasswordResetToken("token_fiktif_12345");
      expect(res.isValid).toBe(false);
      expect(res.message).toContain("tidak valid atau telah kedaluwarsa");
    });

    it("menolak reset password jika password baru kurang dari 6 karakter", async () => {
      await expect(resetPasswordWithToken("token_fiktif", "123")).rejects.toThrow();
    });
  });

  describe("Template Email Reset Kata Sandi (Modular & Testable)", () => {
    it("menghasilkan markup HTML yang berisi tautan reset dan nama penerima", async () => {
      const { buildPasswordResetEmailHtml, PASSWORD_RESET_EMAIL_SUBJECT } = await import(
        "@/templates/emails/passwordResetEmailTemplate"
      );

      const html = buildPasswordResetEmailHtml({
        name: "Ahmad Fauzi",
        resetUrl: "https://pabe.or.id/reset-password?token=secret123",
      });

      expect(PASSWORD_RESET_EMAIL_SUBJECT).toBe("Atur Ulang Kata Sandi Akun - Yayasan PABE");
      expect(html).toContain("Ahmad Fauzi");
      expect(html).toContain("https://pabe.or.id/reset-password?token=secret123");
      expect(html).toContain("Atur Ulang Kata Sandi");
      expect(html).toContain("logo-ypabe.png");
    });
  });

  describe("Kebijakan Kuota Harian Reset Kata Sandi (Anti-Flooding)", () => {
    it("memiliki kebijakan 3 kali per 24 jam", async () => {
      const { PASSWORD_RESET_POLICY } = await import("@/services/passwordResetService");
      expect(PASSWORD_RESET_POLICY.DAILY_LIMIT).toBe(3);
      expect(PASSWORD_RESET_POLICY.WINDOW_MS).toBe(24 * 60 * 60 * 1000);
      expect(PASSWORD_RESET_POLICY.TOKEN_EXPIRY_MINUTES).toBe(30);
    });

    it("membatasi permintaan reset ke-4 pada email yang sama dalam 24 jam", async () => {
      const {
        checkDailyPasswordResetLimit,
        rollbackDailyPasswordResetLimit,
      } = await import("@/services/passwordResetService");
      const { globalRateLimiter } = await import("@/lib/rateLimit");

      const testEmail = "donor.test.daily.limit@example.com";
      globalRateLimiter.reset(`auth_forgot_password_daily:${testEmail}`);

      // Percobaan 1, 2, 3 diizinkan
      const res1 = checkDailyPasswordResetLimit(testEmail);
      expect(res1.success).toBe(true);
      expect(res1.remaining).toBe(2);

      const res2 = checkDailyPasswordResetLimit(testEmail);
      expect(res2.success).toBe(true);
      expect(res2.remaining).toBe(1);

      const res3 = checkDailyPasswordResetLimit(testEmail);
      expect(res3.success).toBe(true);
      expect(res3.remaining).toBe(0);

      // Percobaan 4 ditolak
      const res4 = checkDailyPasswordResetLimit(testEmail);
      expect(res4.success).toBe(false);
      expect(res4.remaining).toBe(0);
      expect(res4.resetMs).toBeGreaterThan(0);

      // Rollback satu kuota
      rollbackDailyPasswordResetLimit(testEmail);
      const resAfterRollback = checkDailyPasswordResetLimit(testEmail);
      expect(resAfterRollback.success).toBe(true);

      globalRateLimiter.reset(`auth_forgot_password_daily:${testEmail}`);
    });
  });
});


