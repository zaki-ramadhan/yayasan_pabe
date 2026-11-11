import { NextResponse } from "next/server";
import { registerVolunteer } from "@/services/volunteerService";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "volunteer_register",
      limit: 10,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json();

    // Validasi Anti-Bot Cloudflare Turnstile
    const clientIp = getClientIp(request);
    const turnstileCheck = await verifyTurnstileToken(body?.turnstileToken, clientIp);
    if (!turnstileCheck.success) {
      return NextResponse.json(
        {
          success: false,
          message: turnstileCheck.message || "Verifikasi keamanan Turnstile gagal.",
          errorCodes: turnstileCheck.errorCodes,
        },
        { status: 403 }
      );
    }

    const result = await registerVolunteer(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses pendaftaran relawan." },
      { status: 400 }
    );
  }
}
