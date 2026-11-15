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

    const isDecrement = action === "decrement";

    try {
      const existing = await prisma.donation.findUnique({
        where: { id: donationId },
        select: { id: true, aminCount: true },
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, message: "Doa donasi tidak ditemukan." },
          { status: 404 }
        );
      }

      const nextCount = isDecrement
        ? Math.max(0, Number(existing.aminCount || 0) - 1)
        : Math.max(0, Number(existing.aminCount || 0) + 1);

      const updated = await prisma.donation.update({
        where: { id: donationId },
        data: {
          aminCount: nextCount,
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
