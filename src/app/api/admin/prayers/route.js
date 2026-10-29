import { NextResponse } from "next/server";
import {
  getAdminPrayers,
  toggleHidePrayer,
  toggleHidePrayerBatch,
  togglePinPrayer,
  replyPrayer,
} from "@/services/prayerService";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = [
  USER_ROLES.SUPER_ADMIN,
  USER_ROLES.ADMIN,
  USER_ROLES.VOLUNTEER,
];

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const campaignId = searchParams.get("campaignId") || "";

    const data = await getAdminPrayers({ page, limit, search, status, campaignId });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("GET /api/admin/prayers error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal memuat data doa donatur." },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  const { user, errorResponse } = await requireAuth(request, ADMIN_ROLES);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { action, donationId, donationIds } = body;

    // Penanganan Moderasi Massal (Bulk Moderation)
    if (action === "BULK_HIDE" || action === "BULK_SHOW") {
      const ids = Array.isArray(donationIds) ? donationIds : donationId ? [donationId] : [];
      if (ids.length === 0) {
        return NextResponse.json(
          { success: false, message: "Daftar ID doa donatur tidak boleh kosong." },
          { status: 400 }
        );
      }
      const isHidden = action === "BULK_HIDE";
      const result = await toggleHidePrayerBatch({ donationIds: ids, isHidden });
      return NextResponse.json({
        success: true,
        message: `${result.count} doa berhasil ${isHidden ? "disembunyikan" : "ditampilkan ke publik"}.`,
        data: result,
      });
    }

    if (!donationId) {
      return NextResponse.json(
        { success: false, message: "ID transaksi donasi tidak valid." },
        { status: 400 }
      );
    }

    let result;
    const actorInfo = {
      actorId: user.id,
      actorName: user.name || "Admin Yayasan",
      actorRole: user.role || "ADMIN",
    };

    switch (action) {
      case "HIDE":
        result = await toggleHidePrayer({ donationId, isHidden: true, ...actorInfo });
        break;
      case "SHOW":
        result = await toggleHidePrayer({ donationId, isHidden: false, ...actorInfo });
        break;
      case "PIN":
        result = await togglePinPrayer({ donationId, isPinned: true, ...actorInfo });
        break;
      case "UNPIN":
        result = await togglePinPrayer({ donationId, isPinned: false, ...actorInfo });
        break;
      case "REPLY":
        result = await replyPrayer({
          donationId,
          replyText: body.replyText,
          ...actorInfo,
        });
        break;
      default:
        return NextResponse.json(
          { success: false, message: "Aksi moderasi tidak dikenal." },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: "Status moderasi doa berhasil diperbarui.",
      data: result,
    });
  } catch (error) {
    console.error("PATCH /api/admin/prayers error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memproses moderasi doa." },
      { status: 500 }
    );
  }
}
