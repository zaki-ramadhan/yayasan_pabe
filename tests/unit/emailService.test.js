import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  parseEmailSender,
  getEmailConfig,
  sendEmail,
} from "@/services/emailService";

describe("EmailService - Dual Provider (Resend + Brevo Fallback)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("parseEmailSender", () => {
    it("mem-parsing format nama dan email standar dengan tanda kurung sudut", () => {
      const result = parseEmailSender("Yayasan Payung Berkah <noreply@pabe.or.id>");
      expect(result).toEqual({
        name: "Yayasan Payung Berkah",
        email: "noreply@pabe.or.id",
      });
    });

    it("menangani format email murni tanpa nama", () => {
      const result = parseEmailSender("admin@pabe.or.id");
      expect(result).toEqual({
        name: "Yayasan Payung Berkah",
        email: "admin@pabe.or.id",
      });
    });

    it("mengembalikan default aman jika input null atau kosong", () => {
      const result = parseEmailSender("");
      expect(result).toEqual({
        name: "Yayasan Payung Berkah",
        email: "noreply@pabe.or.id",
      });
    });
  });

  describe("getEmailConfig", () => {
    it("mengambil API key dan email pengirim dari environment variable", () => {
      process.env.RESEND_API_KEY = "re_test_123";
      process.env.BREVO_API_KEY = "xkeysib-test-456";
      process.env.RESEND_FROM_EMAIL = "PABE <info@pabe.or.id>";

      const config = getEmailConfig();
      expect(config.resendApiKey).toBe("re_test_123");
      expect(config.brevoApiKey).toBe("xkeysib-test-456");
      expect(config.fromEmail).toBe("PABE <info@pabe.or.id>");
    });
  });

  describe("sendEmail Provider Execution & Failover", () => {
    it("menjalankan simulasi aman jika tidak ada API key yang dikonfigurasi", async () => {
      delete process.env.VITEST;
      process.env.NODE_ENV = "development";
      delete process.env.RESEND_API_KEY;
      delete process.env.BREVO_API_KEY;

      const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      const result = await sendEmail({
        to: "donatur@example.com",
        subject: "Terima Kasih",
        html: "<p>Halo</p>",
      });

      expect(result.success).toBe(true);
      expect(result.simulated).toBe(true);
      expect(consoleInfoSpy).toHaveBeenCalled();
    });

    it("mengirim via Resend jika RESEND_API_KEY aktif dan request berhasil", async () => {
      delete process.env.VITEST;
      process.env.NODE_ENV = "production";
      process.env.RESEND_API_KEY = "re_valid_key";
      delete process.env.BREVO_API_KEY;

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ id: "resend_msg_001" }),
      });

      const result = await sendEmail({
        to: "donatur@example.com",
        subject: "Kuitansi Donasi",
        html: "<p>Kuitansi</p>",
      });

      expect(result.success).toBe(true);
      expect(result.id).toBe("resend_msg_001");
      expect(result.provider).toBe("resend");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.resend.com/emails",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("melakukan failover otomatis ke Brevo jika Resend mengembalikan error/rate-limit", async () => {
      delete process.env.VITEST;
      process.env.NODE_ENV = "production";
      process.env.RESEND_API_KEY = "re_valid_key";
      process.env.BREVO_API_KEY = "xkeysib_valid_key";

      // Panggilan pertama: Resend gagal (429 Rate Limit)
      // Panggilan kedua: Brevo berhasil (201 Created)
      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({ message: "Rate limit exceeded. Daily quota reached." }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 201,
          json: async () => ({ messageId: "<brevo_msg_002@smtp-relay.mailin.fr>" }),
        });

      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
      const consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

      const result = await sendEmail({
        to: "donatur@example.com",
        subject: "Tagihan Donasi Rutin",
        html: "<p>Tagihan</p>",
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe("brevo");
      expect(result.failover).toBe(true);
      expect(result.id).toBe("<brevo_msg_002@smtp-relay.mailin.fr>");
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining("Mengaktifkan failover otomatis ke Brevo")
      );
    });

    it("mengirim langsung via Brevo jika hanya BREVO_API_KEY yang dikonfigurasi", async () => {
      delete process.env.VITEST;
      process.env.NODE_ENV = "production";
      delete process.env.RESEND_API_KEY;
      process.env.BREVO_API_KEY = "xkeysib_valid_key";

      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ messageId: "<brevo_direct_003@smtp-relay.mailin.fr>" }),
      });

      const result = await sendEmail({
        to: "relawan@example.com",
        subject: "Status Relawan",
        html: "<p>Status</p>",
      });

      expect(result.success).toBe(true);
      expect(result.provider).toBe("brevo");
      expect(result.id).toBe("<brevo_direct_003@smtp-relay.mailin.fr>");
      expect(global.fetch).toHaveBeenCalledWith(
        "https://api.brevo.com/v3/smtp/email",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("melempar error jika kedua provider (Resend & Brevo) gagal", async () => {
      delete process.env.VITEST;
      process.env.NODE_ENV = "production";
      process.env.RESEND_API_KEY = "re_valid_key";
      process.env.BREVO_API_KEY = "xkeysib_valid_key";

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          json: async () => ({ message: "Resend quota exhausted" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ message: "Brevo internal error" }),
        });

      vi.spyOn(console, "warn").mockImplementation(() => {});
      vi.spyOn(console, "error").mockImplementation(() => {});

      await expect(
        sendEmail({
          to: "donatur@example.com",
          subject: "Tes Gagal",
          html: "<p>Tes</p>",
        })
      ).rejects.toThrow("Pengiriman email gagal pada kedua provider");
    });
  });
});

