import { NextResponse } from "next/server";
import { checkRateLimit, rollbackRateLimit } from "@/lib/rateLimit";
import { validateEmail } from "@/lib/security";
import {
  resendActivationWorkflow,
  checkDailyActivationResendLimit,
  rollbackDailyActivationResendLimit,
  ACCOUNT_ACTIVATION_POLICY,
} from "@/services/accountActivationService";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const isRateLimitDisabled = process.env.DISABLE_RATE_LIMIT === "true";
  const ipRateLimitAction = "auth_resend_activation_ip";
  let validatedEmail = null;

  try {
    // 1. Rate Limit Proteksi IP: Maksimal 10 permintaan per IP per 15 menit
    const rateLimitBlocked = isRateLimitDisabled
      ? null
      : checkRateLimit(request, {
          action: ipRateLimitAction,
          limit: 10,
          windowMs: 15 * 60 * 1000,
        });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json().catch(() => ({}));
    const { email } = body || {};

    const cleanEmail = String(email || "").trim().toLowerCase();
    const emailCheck = validateEmail(cleanEmail, true);

    if (!emailCheck.isValid) {
      if (!isRateLimitDisabled) {
        rollbackRateLimit(request, { action: ipRateLimitAction });
      }
      return NextResponse.json(
        {
          success: false,
          message:
            emailCheck.message ||
            emailCheck.error ||
            "Format alamat email tidak valid (contoh: nama@email.com).",
        },
        { status: 400 }
      );
    }

    validatedEmail = cleanEmail;

    // 2. Proteksi Kuota Harian Akun: Maksimal 3 kali kirim ulang per email per 24 jam (Anti-Flooding)
    if (!isRateLimitDisabled) {
      const dailyQuota = checkDailyActivationResendLimit(cleanEmail);
      if (!dailyQuota.success) {
        const retrySec = Math.ceil(dailyQuota.resetMs / 1000);
        return NextResponse.json(
          {
            success: false,
            message: `Batas pengiriman ulang email aktivasi harian untuk email ini telah tercapai (maksimal ${ACCOUNT_ACTIVATION_POLICY.DAILY_RESEND_LIMIT} kali per hari). Silakan periksa kotak masuk email Anda atau hubungi pengurus yayasan.`,
            retryAfter: retrySec,
          },
          {
            status: 429,
            headers: {
              "Retry-After": String(retrySec),
              "X-RateLimit-Limit": String(ACCOUNT_ACTIVATION_POLICY.DAILY_RESEND_LIMIT),
              "X-RateLimit-Remaining": "0",
            },
          }
        );
      }
    }

    const originUrl = request.nextUrl.origin || process.env.NEXT_PUBLIC_APP_URL;
    const result = await resendActivationWorkflow(cleanEmail, originUrl);

    return NextResponse.json(result);
  } catch (error) {
    if (!isRateLimitDisabled) {
      rollbackRateLimit(request, { action: ipRateLimitAction });
      if (validatedEmail) {
        rollbackDailyActivationResendLimit(validatedEmail);
      }
    }
    console.error("[API POST /api/auth/resend-activation] Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memproses pengiriman ulang email aktivasi.",
      },
      { status: 500 }
    );
  }
}
