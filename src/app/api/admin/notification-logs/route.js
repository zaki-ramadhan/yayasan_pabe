import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { getAdminNotificationLogs } from "@/services/adminNotificationLogService";
import { getQueueStats } from "@/services/notificationQueueService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const [logs, stats] = await Promise.all([
      getAdminNotificationLogs({ search, status, page, limit }),
      getQueueStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: logs.items,
      stats,
      pagination: {
        page: logs.page,
        totalPages: logs.totalPages,
        total: logs.total,
        limit,
      },
    });
  } catch (error) {
    console.error("[AdminNotificationLogs API Error]", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memuat log pengiriman notifikasi." },
      { status: 500 }
    );
  }
}
