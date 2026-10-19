import { NextResponse } from "next/server";
import { getJobVacancies } from "@/services/careerService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function GET(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "careers_get",
      limit: 60,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const location = searchParams.get("location") || "Semua Lokasi";
    const type = searchParams.get("type") || "Semua Tipe";
    const department = searchParams.get("department") || "Semua Divisi";

    const data = await getJobVacancies({ search, location, type, department });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memuat daftar lowongan pekerjaan.",
      },
      { status: 500 }
    );
  }
}
