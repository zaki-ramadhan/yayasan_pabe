import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "donation_amin",
      limit: 40,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const body = await request.json();
    const { donationId, action = "increment" } = body || {};

    if (!donationId || typeof donationId !== "string") {
      return NextResponse.json(
        { success: false, message: "ID donasi / doa wajib disertakan." },
        { status: 400 }
      );
    }

    const delta = action === "decrement" ? -1 : 1;

    try {
      const updated = await prisma.donation.update({
        where: { id: donationId },
        data: {
          aminCount: { increment: delta },
        },
        select: {
          id: true,
          aminCount: true,
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          aminCount: Math.max(0, updated.aminCount),
        },
      });
    } catch (dbErr) {
      return NextResponse.json(
        { success: false, message: "Doa donasi tidak ditemukan." },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui respon aamiin doa." },
      { status: 500 }
    );
  }
}
