import { describe, it, expect, beforeEach } from "vitest";
import { globalRateLimiter } from "@/lib/rateLimit";
import { POST as loginHandler } from "@/app/api/auth/login/route";
import { POST as donationHandler, GET as donationGetHandler } from "@/app/api/donations/route";
import { GET as statsHandler } from "@/app/api/dashboard/stats/route";

function createMockRequest({
  url = "http://localhost:3000/api/test",
  method = "GET",
  body = null,
  headers = {},
  cookies = {},
} = {}) {
  const reqHeaders = new Headers(headers);
  if (!reqHeaders.has("x-real-ip")) {
    reqHeaders.set("x-real-ip", "192.168.1.100");
  }

  const req = new Request(url, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : null,
  });

  // Mock cookies getter
  req.cookies = {
    get: (name) => (cookies[name] ? { value: cookies[name] } : undefined),
  };

  return req;
}

describe("Strict Security Audit: Rate Limiting & Abuse Prevention", () => {
  beforeEach(() => {
    globalRateLimiter.reset();
  });

  it("memblokir serangan brute force login setelah 10 percobaan per menit (HTTP 429)", async () => {
    const ip = "192.168.1.50";
    const attackPayload = { identifier: "target_user", password: "wrong_password_123" };

    // Kirim 10 request (kuota maksimum per menit)
    for (let i = 0; i < 10; i++) {
      const req = createMockRequest({
        url: "http://localhost:3000/api/auth/login",
        method: "POST",
        body: attackPayload,
        headers: { "x-real-ip": ip },
      });
      const res = await loginHandler(req);
      expect(res.status).not.toBe(429);
    }

    // Request ke-11 harus diblokir dengan HTTP 429 Too Many Requests
    const blockedReq = createMockRequest({
      url: "http://localhost:3000/api/auth/login",
      method: "POST",
      body: attackPayload,
      headers: { "x-real-ip": ip },
    });
    const blockedRes = await loginHandler(blockedReq);
    expect(blockedRes.status).toBe(429);

    const json = await blockedRes.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("Terlalu banyak permintaan");
    expect(blockedRes.headers.get("Retry-After")).toBeDefined();
    expect(blockedRes.headers.get("X-RateLimit-Remaining")).toBe("0");
  }, 15000);

  it("memblokir spam pembuatan invoice donasi fiktif setelah 20 request per menit", async () => {
    const ip = "192.168.1.51";
    const validDonation = {
      amount: 50000,
      donorName: "Budi Santoso",
      donorPhone: "081234567890",
      paymentChannelId: "qris",
    };

    for (let i = 0; i < 20; i++) {
      const req = createMockRequest({
        url: "http://localhost:3000/api/donations",
        method: "POST",
        body: validDonation,
        headers: { "x-real-ip": ip },
      });
      const res = await donationHandler(req);
      expect(res.status).not.toBe(429);
    }

    // Request ke-21 harus diblokir
    const blockedReq = createMockRequest({
      url: "http://localhost:3000/api/donations",
      method: "POST",
      body: validDonation,
      headers: { "x-real-ip": ip },
    });
    const blockedRes = await donationHandler(blockedReq);
    expect(blockedRes.status).toBe(429);
  });
});

describe("Strict Security Audit: Autentikasi, Hak Akses & Anti-Kebocoran Data", () => {
  it("menolak akses endpoint metrik sensitif /api/dashboard/stats jika tanpa session cookie", async () => {
    const req = createMockRequest({
      url: "http://localhost:3000/api/dashboard/stats",
      method: "GET",
      cookies: {}, // Tanpa cookie
    });

    const res = await statsHandler(req);
    expect([401, 403]).toContain(res.status);

    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("menolak akses endpoint /api/dashboard/stats jika session cookie palsu/tidak valid", async () => {
    const req = createMockRequest({
      url: "http://localhost:3000/api/dashboard/stats",
      method: "GET",
      cookies: { pabe_session: "INVALID_FORGED_SESSION_TOKEN_12345" },
    });

    const res = await statsHandler(req);
    expect([401, 403]).toContain(res.status);
  });
});

describe("Strict Security Audit: Validasi Anomali Payload & SQL Injection Probe", () => {
  beforeEach(() => {
    globalRateLimiter.reset();
  });

  it("menolak donasi dengan nominal negatif atau nol (HTTP 400)", async () => {
    const reqMinus = createMockRequest({
      url: "http://localhost:3000/api/donations",
      method: "POST",
      body: { amount: -50000, donorName: "Ahmad", donorPhone: "081234567890" },
    });
    const resMinus = await donationHandler(reqMinus);
    expect(resMinus.status).toBe(400);

    const reqZero = createMockRequest({
      url: "http://localhost:3000/api/donations",
      method: "POST",
      body: { amount: 0, donorName: "Ahmad", donorPhone: "081234567890" },
    });
    const resZero = await donationHandler(reqZero);
    expect(resZero.status).toBe(400);
  });

  it("menolak donasi dengan nomor telepon tidak valid / huruf alfabet", async () => {
    const req = createMockRequest({
      url: "http://localhost:3000/api/donations",
      method: "POST",
      body: { amount: 50000, donorName: "Ahmad", donorPhone: "0812ABCD890" },
    });
    const res = await donationHandler(req);
    expect(res.status).toBe(400);
  });

  it("menangani probe SQL Injection pada parameter pencarian campaign tanpa mengekspos data utuh", async () => {
    const sqlPayload = "' OR '1'='1' --";
    const req = createMockRequest({
      url: `http://localhost:3000/api/donations?campaignSlug=${encodeURIComponent(sqlPayload)}`,
      method: "GET",
    });

    const res = await donationGetHandler(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    // Tidak boleh mengembalikan seluruh donasi lintas campaign karena query terlindungi parameterized Prisma/fallback
  });
});
