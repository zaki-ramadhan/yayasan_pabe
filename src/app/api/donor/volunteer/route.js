import { NextResponse } from "next/server";
import { getVolunteerByEmail } from "@/services/volunteerVerificationService";

export async function GET(request) {
  try {
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
