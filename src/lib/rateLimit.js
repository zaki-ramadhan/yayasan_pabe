import { NextResponse } from "next/server";

/**
 * Lightweight in-memory sliding window rate limiter.
 * Zero external dependency, clean, and safe for serverless/edge/node runtimes.
 */
export class RateLimiter {
  constructor() {
    this.store = new Map();
  }

  /**
   * Check quota for a given key.
   * @param {string} key - Unique key (e.g., action:ip)
   * @param {number} limit - Maximum requests permitted in the window
   * @param {number} windowMs - Window duration in milliseconds (default: 60,000ms = 1 min)
   * @returns {{ success: boolean, remaining: number, resetMs: number }}
   */
  check(key, limit = 10, windowMs = 60000) {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      this.store.set(key, { count: 1, resetTime: now + windowMs });
      this.cleanup(now);
      return { success: true, remaining: limit - 1, resetMs: windowMs };
    }

    if (record.count >= limit) {
      return {
        success: false,
        remaining: 0,
        resetMs: Math.max(0, record.resetTime - now),
      };
    }

    record.count += 1;
    return {
      success: true,
      remaining: limit - record.count,
      resetMs: Math.max(0, record.resetTime - now),
    };
  }

  cleanup(now) {
    if (this.store.size > 2000) {
      for (const [k, v] of this.store.entries()) {
        if (now > v.resetTime) {
          this.store.delete(k);
        }
      }
    }
  }

  reset(key) {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}

export const globalRateLimiter = new RateLimiter();

/**
 * Extracts client IP from request headers or fallbacks to 127.0.0.1
 * @param {Request} request
 * @returns {string}
 */
export function getClientIp(request) {
  if (!request) return "127.0.0.1";
  const forwarded = request.headers?.get?.("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers?.get?.("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

/**
 * Helper to apply rate limiting in Next.js Route Handlers.
 * Returns null if allowed, or NextResponse with HTTP 429 if limit exceeded.
 * @param {Request} request
 * @param {{ action: string, limit: number, windowMs: number }} options
 * @returns {NextResponse|null}
 */
export function checkRateLimit(request, { action = "api", limit = 10, windowMs = 60000 } = {}) {
  const ip = getClientIp(request);
  const key = `${action}:${ip}`;
  const result = globalRateLimiter.check(key, limit, windowMs);

  if (!result.success) {
    const retrySec = Math.ceil(result.resetMs / 1000);
    return NextResponse.json(
      {
        success: false,
        message: "Terlalu banyak permintaan dalam waktu singkat. Silakan coba kembali beberapa saat lagi.",
        retryAfter: retrySec,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(retrySec),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  return null;
}
