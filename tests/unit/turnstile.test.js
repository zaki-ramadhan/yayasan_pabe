import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  verifyTurnstileToken,
  CLOUDFLARE_TEST_SITE_KEY,
  CLOUDFLARE_TEST_SECRET_KEY,
} from "@/lib/turnstile";

describe("Cloudflare Turnstile Verification Helper", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("memiliki definisi dummy keys resmi Cloudflare yang valid", () => {
    expect(CLOUDFLARE_TEST_SITE_KEY).toBe("1x00000000000000000000AA");
    expect(CLOUDFLARE_TEST_SECRET_KEY).toBe("1x0000000000000000000000000000000AA");
  });

  it("menolak token jika berupa string kosong atau hanya spasi", async () => {
    const result = await verifyTurnstileToken("   ");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Turnstile wajib diselesaikan");
  });

  it("berhasil memverifikasi jika Cloudflare merespons success: true", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        challenge_ts: new Date().toISOString(),
        hostname: "localhost",
      }),
    });

    const result = await verifyTurnstileToken("valid-token-from-turnstile", "192.168.1.1");
    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const callArgs = global.fetch.mock.calls[0];
    expect(callArgs[0]).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
  });

  it("menolak dan memberikan pesan yang jelas saat Cloudflare merespons token kedaluwarsa atau duplikat", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: false,
        "error-codes": ["timeout-or-duplicate"],
      }),
    });

    const result = await verifyTurnstileToken("expired-or-used-token");
    expect(result.success).toBe(false);
    expect(result.message).toContain("telah kedaluwarsa");
    expect(result.errorCodes).toContain("timeout-or-duplicate");
  });

  it("menangani kegagalan HTTP Cloudflare dengan aman tanpa uncaught exception", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
    });

    const result = await verifyTurnstileToken("any-token");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Gagal menghubungi server");
  });

  it("menangani timeout jaringan secara tangguh", async () => {
    global.fetch = vi.fn().mockImplementation(() => {
      const err = new Error("The operation was aborted");
      err.name = "AbortError";
      return Promise.reject(err);
    });

    const result = await verifyTurnstileToken("timeout-token");
    expect(result.success).toBe(false);
    expect(result.message).toContain("Waktu verifikasi keamanan habis");
    expect(result.errorCodes).toContain("timeout");
  });
});

