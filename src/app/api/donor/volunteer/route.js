import { NextResponse } from "next/server";
import { getVolunteerByEmail } from "@/services/volunteerVerificationService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "donor_volunteer_query",
      limit: 30,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email pengguna wajib disertakan." },
        { status: 400 }
      );
    }

    const volunteer = await getVolunteerByEmail(email);

    return NextResponse.json({
      success: true,
      data: volunteer,
    });
  } catch (error) {
    console.error("Error GET /api/donor/volunteer:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat informasi relawan." },
      { status: 500 }
    );
  }
}
