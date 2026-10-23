import { NextResponse } from "next/server";
import { getDonorPrayers } from "@/services/prayerService";
import { getAuthenticatedUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { user } = await getAuthenticatedUser(request);
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email") || user?.email || "";
    const name = searchParams.get("name") || user?.name || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!email && !name) {
      return NextResponse.json({
        success: true,
        data: { prayers: [], total: 0, totalPages: 1, currentPage: 1 },
      });
    }

    const data = await getDonorPrayers({ userEmail: email, userName: name, page, limit });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/donor/prayers error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat doa donatur." },
      { status: 500 }
    );
  }
}
