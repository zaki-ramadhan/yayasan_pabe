import { NextResponse } from "next/server";
import { checkRateLimit, rollbackRateLimit, getClientIp } from "@/lib/rateLimit";
import { validateEmail } from "@/lib/security";
import { verifyTurnstileToken } from "@/lib/turnstile";
import {
  requestPasswordReset,
  checkDailyPasswordResetLimit,
  rollbackDailyPasswordResetLimit,
  PASSWORD_RESET_POLICY,
} from "@/services/passwordResetService";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const isRateLimitDisabled = process.env.DISABLE_RATE_LIMIT === "true";
  const ipRateLimitAction = "auth_forgot_password_ip";
  let validatedEmail = null;

  try {
    const rateLimitBlocked = isRateLimitDisabled
      ? null
      : checkRateLimit(request, {
          action: ipRateLimitAction,
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json().catch(() => ({}));
    const { email, turnstileToken } = body || {};

    const clientIp = getClientIp(request);
    const turnstileCheck = await verifyTurnstileToken(turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      if (!isRateLimitDisabled) {
        rollbackRateLimit(request, { action: ipRateLimitAction });
      }
      return NextResponse.json(
        {
          success: false,
          message: turnstileCheck.message || "Verifikasi keamanan Turnstile gagal.",
          errorCodes: turnstileCheck.errorCodes,
        },
        { status: 403 }
      );
    }

    const cleanEmail = String(email || "").trim().toLowerCase();
    const emailCheck = validateEmail(cleanEmail, true);

    if (!emailCheck.isValid) {
      if (!isRateLimitDisabled) {
        rollbackRateLimit(request, { action: ipRateLimitAction });
      }
      return NextResponse.json(
        {
          success: false,
          message: emailCheck.message || "Format alamat email tidak valid (contoh: nama@email.com).",
        },
        { status: 400 }
      );
    }

    validatedEmail = cleanEmail;

    if (!isRateLimitDisabled) {
      const dailyQuota = checkDailyPasswordResetLimit(cleanEmail);
      if (!dailyQuota.success) {
        const retrySec = Math.ceil(dailyQuota.resetMs / 1000);
        return NextResponse.json(
          {
            success: false,
            message: `Batas permintaan reset kata sandi harian untuk email ini telah tercapai (maksimal ${PASSWORD_RESET_POLICY.DAILY_LIMIT} kali per hari). Silakan periksa kotak masuk email Anda atau hubungi pengurus yayasan.`,
            retryAfter: retrySec,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retrySec),
              "X-RateLimit-Limit": String(PASSWORD_RESET_POLICY.DAILY_LIMIT),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
    }

    const origin =
      request.headers.get("origin") ||
      request.nextUrl?.origin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "http://localhost:3000";

    const result = await requestPasswordReset(cleanEmail, origin);

    return NextResponse.json(
      {
        success: true,
        message: result.message,
      },
      { status: 200 }
    );
  } catch (error) {
    if (!isRateLimitDisabled) {
      rollbackRateLimit(request, { action: ipRateLimitAction });
      if (validatedEmail) {
        rollbackDailyPasswordResetLimit(validatedEmail);
      }
    }
    console.error("API POST /api/auth/forgot-password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Terjadi kendala saat memproses permintaan reset kata sandi.",
      },
      { status: 500 }
    );
  }
}
