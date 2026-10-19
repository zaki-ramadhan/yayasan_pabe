import { NextResponse } from "next/server";
import { createRoutineDonations } from "@/services/routineDonationService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "routine_donation_create",
      limit: 10,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json();
    const result = await createRoutineDonations(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memproses pendaftaran donasi rutin.",
      },
      { status: 400 }
    );
  }
}
