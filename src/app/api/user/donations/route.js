import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  getDonorHistory,
  getDonorDashboardOverview,
  getDonorMonthlyTrend,
  buildUserWhereClause,
} from "@/services/donorService";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { checkRateLimit } from "@/lib/rateLimit";
import { checkMidtransOrderStatus } from "@/services/midtransService";
import { settleDonationStatus } from "@/services/donationService";
import { getMidtransServerKey } from "@/lib/midtransConfig";
import {
  getPendingInvoicesForUser,
  cancelAndExpirePendingDonation,
  expireDonationRecord,
} from "@/services/donationExpiryService";

export async function GET(request) {
  const rateLimitBlocked = checkRateLimit(request, {
    action: "user_donations_history",
    limit: 60,
    windowMs: 60000,
  });
  if (rateLimitBlocked) return rateLimitBlocked;

  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const requestedEmail = searchParams.get("email");
    const requestedName = searchParams.get("name");
    const mode = searchParams.get("mode") || "";
    const status = searchParams.get("status") || "ALL";
    const year = searchParams.get("year") || "";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";

    // Strict Scope: Regular users can only access their own donations (Anti-IDOR)
    const isAdmin = authUser.role && authUser.role !== USER_ROLES.DONOR;
    const userEmail = (isAdmin && requestedEmail) ? requestedEmail : authUser.email;
    const userName = (isAdmin && requestedName) ? requestedName : authUser.name;
    const userPhone = authUser.phone || "";

    // Proactive status reconciliation for recent pending donations with Midtrans
    if (getMidtransServerKey() && process.env.NODE_ENV !== "test") {
      try {
        const identityCondition = buildUserWhereClause(userEmail, userName, userPhone);

        if (identityCondition) {
          const pendingDonations = await prisma.donation.findMany({
            where: {
              status: "PENDING",
              ...identityCondition,
              createdAt: { gte: new Date(Date.now() - 48 * 60 * 60 * 1000) },
            },
            select: { invoiceId: true, expiredAt: true },
            take: 5,
          });

          for (const item of pendingDonations) {
            const midtransStatus = await checkMidtransOrderStatus(item.invoiceId);
            if (midtransStatus.isPaid) {
              await settleDonationStatus(
                item.invoiceId,
                midtransStatus.settlementTime ? new Date(midtransStatus.settlementTime) : new Date()
              );
            } else if (
              midtransStatus.status === "EXPIRED" ||
              (item.expiredAt && new Date() > new Date(item.expiredAt))
            ) {
              await expireDonationRecord(item.invoiceId, "USER_PROACTIVE_RECONCILE");
            }
          }
        }
      } catch (reconcileErr) {
        console.warn("User donations proactive reconciliation warning:", reconcileErr?.message);
      }
    }

    if (mode === "pending") {
      const campaignId = searchParams.get("campaignId") || null;
      const data = await getPendingInvoicesForUser({
        userEmail,
        userName,
        userPhone,
        campaignId,
        limit: 10,
      });

      return NextResponse.json({
        success: true,
        data,
      });
    }

    if (mode === "trend") {
      const data = await getDonorMonthlyTrend({
        userEmail,
        userName,
        userPhone,
        year,
      });

      return NextResponse.json({
        success: true,
        data,
      });
    }

    if (mode === "dashboard") {
      const data = await getDonorDashboardOverview({
        userEmail,
        userName,
        userPhone,
        year,
      });

      return NextResponse.json({
        success: true,
        data,
      });
    }

    const data = await getDonorHistory({
      userEmail,
      userName,
      userPhone,
      status,
      search,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("API GET /api/user/donations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memuat riwayat donasi.",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/donations
 * Memungkinkan donatur membatalkan tagihan donasi PENDING (misal sebelum membuat donasi baru)
 */
export async function PATCH(request) {
  const rateLimitBlocked = checkRateLimit(request, {
    action: "user_donations_mutate",
    limit: 20,
    windowMs: 60000,
  });
  if (rateLimitBlocked) return rateLimitBlocked;

  const { user: authUser, errorResponse } = await requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json().catch(() => ({}));
    const { invoiceId, action } = body;

    if (!invoiceId) {
      return NextResponse.json(
        { success: false, message: "Nomor invoice diperlukan." },
        { status: 400 }
      );
    }

    if (action === "cancel") {
      const result = await cancelAndExpirePendingDonation(invoiceId, authUser);
      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json(
      { success: false, message: "Aksi tidak dikenali." },
      { status: 400 }
    );
  } catch (error) {
    console.error("API PATCH /api/user/donations error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal memproses pembatalan tagihan.",
      },
      { status: 500 }
    );
  }
}

