import { NextResponse } from "next/server";
import { createRoutineDonations, getActiveRoutineDonation } from "@/services/routineDonationService";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    if (!email) {
      return NextResponse.json({ success: true, hasActive: false, routine: null });
    }

    const routine = await getActiveRoutineDonation(email);
    return NextResponse.json({
      success: true,
      hasActive: Boolean(routine),
      routine,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memeriksa jadwal donasi rutin.",
      },
      { status: 500 }
    );
  }
}

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
    const status = error.statusCode || 400;
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memproses pendaftaran donasi rutin.",
      },
      { status }
    );
  }
}
