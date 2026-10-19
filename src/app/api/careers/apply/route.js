import { NextResponse } from "next/server";
import { submitJobApplication } from "@/services/careerService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "careers_apply",
      limit: 5,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json();
    const result = await submitJobApplication(body);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memproses pengiriman berkas lamaran.",
      },
      { status: 400 }
    );
  }
}
