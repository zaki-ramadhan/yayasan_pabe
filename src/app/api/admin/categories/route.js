import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/serverAuth";
import { USER_ROLES } from "@/services/authService";
import { createAdminCategory } from "@/services/adminService";
import prisma from "@/lib/prisma";

export async function GET(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
    USER_ROLES.FINANCE,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const categories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.warn("Prisma getCategories fallback:", error.message);
    return NextResponse.json({
      success: true,
      data: [
        { id: "cat-1", name: "Pendidikan & Santri", slug: "pendidikan" },
        { id: "cat-2", name: "Kesehatan Dhuafa", slug: "kesehatan" },
        { id: "cat-3", name: "Pemberdayaan Ekonomi", slug: "ekonomi" },
        { id: "cat-4", name: "Tanggap Bencana", slug: "bencana" },
      ],
    });
  }
}

export async function POST(request) {
  const { errorResponse } = await requireAuth(request, [
    USER_ROLES.SUPER_ADMIN,
    USER_ROLES.ADMIN,
  ]);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, message: "Nama kategori wajib diisi." },
        { status: 400 }
      );
    }

    const category = await createAdminCategory(body.name);
    return NextResponse.json({
      success: true,
      message: "Kategori baru berhasil dibuat.",
      data: category,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal membuat kategori baru." },
      { status: 500 }
    );
  }
}
