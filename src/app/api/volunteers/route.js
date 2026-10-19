import { NextResponse } from "next/server";
import { registerVolunteer } from "@/services/volunteerService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "volunteer_register",
      limit: 10,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json();
    const result = await registerVolunteer(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses pendaftaran relawan." },
      { status: 400 }
    );
  }
}
