import { NextResponse } from "next/server";
import { getDonorPrayers } from "@/services/prayerService";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { checkRateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "donor_prayers_query",
      limit: 30,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { user, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("email")?.trim().toLowerCase();
    const isStaff = Boolean(user.role && user.role !== USER_ROLES.DONOR);

    if (requestedEmail && !isStaff && requestedEmail !== user.email.trim().toLowerCase()) {
      return NextResponse.json(
        { success: false, message: "Anda tidak memiliki izin untuk melihat doa donatur lain." },
        { status: 403 }
      );
    }

    const email = (isStaff && requestedEmail) ? requestedEmail : user.email;
    const name = (isStaff && searchParams.get("name")) ? searchParams.get("name") : (user.name || "");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

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
