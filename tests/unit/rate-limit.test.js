import { describe, it, expect, beforeEach } from "vitest";
import {
  RateLimiter,
  getClientIp,
  checkRateLimit,
  globalRateLimiter,
} from "@/lib/rateLimit";

describe("Rate Limiter Engine (Token Bucket / Sliding Window)", () => {
  let limiter;

  beforeEach(() => {
    limiter = new RateLimiter();
    globalRateLimiter.reset();
  });

  it("mengizinkan request di bawah ambang batas limit", () => {
    const key = "test:127.0.0.1";
    const res1 = limiter.check(key, 3, 60000);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(2);

    const res2 = limiter.check(key, 3, 60000);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(1);

    const res3 = limiter.check(key, 3, 60000);
    expect(res3.success).toBe(true);
    expect(res3.remaining).toBe(0);
  });

  it("memblokir request saat limit terlampaui (mencegah DoS / spam flood)", () => {
    const key = "test:attack-ip";
    limiter.check(key, 2, 60000);
    limiter.check(key, 2, 60000);

    // Request ke-3 harus ditolak
    const blockedRes = limiter.check(key, 2, 60000);
    expect(blockedRes.success).toBe(false);
    expect(blockedRes.remaining).toBe(0);
    expect(blockedRes.resetMs).toBeGreaterThan(0);
  });

  it("mereset counter setelah reset manual atau window expired", () => {
    const key = "test:reset-key";
    limiter.check(key, 1, 60000);
    expect(limiter.check(key, 1, 60000).success).toBe(false);

    limiter.reset(key);
    expect(limiter.check(key, 1, 60000).success).toBe(true);
  });
});

describe("Client IP Resolution & Extraction", () => {
  it("mengekstrak IP pertama dari header X-Forwarded-For", () => {
    const mockReq = {
      headers: new Headers({
        "x-forwarded-for": "203.0.113.195, 70.41.3.18, 150.172.238.178",
      }),
    };
    expect(getClientIp(mockReq)).toBe("203.0.113.195");
  });

  it("mengambil IP dari header X-Real-IP jika X-Forwarded-For tidak ada", () => {
    const mockReq = {
      headers: new Headers({
        "x-real-ip": "198.51.100.4",
      }),
    };
    expect(getClientIp(mockReq)).toBe("198.51.100.4");
  });

  it("fallback ke 127.0.0.1 jika tidak ada header IP", () => {
    const mockReq = { headers: new Headers() };
    expect(getClientIp(mockReq)).toBe("127.0.0.1");
    expect(getClientIp(null)).toBe("127.0.0.1");
  });
});

describe("Next.js Route Handler checkRateLimit Helper", () => {
  beforeEach(() => {
    globalRateLimiter.reset();
  });

  it("mengembalikan null jika request diizinkan", () => {
    const mockReq = {
      headers: new Headers({ "x-real-ip": "10.0.0.1" }),
    };
    const result = checkRateLimit(mockReq, { action: "unit_test", limit: 5 });
    expect(result).toBeNull();
  });

  it("mengembalikan NextResponse 429 Too Many Requests lengkap dengan header Retry-After", async () => {
    const mockReq = {
      headers: new Headers({ "x-real-ip": "10.0.0.2" }),
    };

    // Penuhi kuota limit 2 request
    checkRateLimit(mockReq, { action: "login_test", limit: 2 });
    checkRateLimit(mockReq, { action: "login_test", limit: 2 });

    // Request ke-3 harus memicu 429
    const response = checkRateLimit(mockReq, { action: "login_test", limit: 2 });
    expect(response).not.toBeNull();
    expect(response.status).toBe(429);

    const headers = response.headers;
    expect(headers.get("Retry-After")).toBeDefined();
    expect(headers.get("X-RateLimit-Limit")).toBe("2");
    expect(headers.get("X-RateLimit-Remaining")).toBe("0");

    const json = await response.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("Terlalu banyak permintaan");
  });
});
