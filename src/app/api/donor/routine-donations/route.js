import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/serverAuth";
import { checkRateLimit } from "@/lib/rateLimit";
import { updateDonorRoutineDonationStatus } from "@/services/routineDonationService";

export const dynamic = "force-dynamic";

export async function PATCH(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "donor_routine_donations",
      limit: 15,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { user } = await getAuthenticatedUser(request);
    const body = await request.json();
    const { id, status } = body || {};

    const result = await updateDonorRoutineDonationStatus({
      id,
      status,
      userEmail: user?.email,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    if (statusCode >= 500) {
      console.error("PATCH /api/donor/routine-donations error:", error);
    }
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memperbarui status donasi rutin.",
      },
      { status: statusCode }
    );
  }
}
