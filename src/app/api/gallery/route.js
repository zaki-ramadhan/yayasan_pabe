import { NextResponse } from "next/server";
import { getPublicGalleryItems } from "@/services/galleryService";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "Semua Kategori";
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "terbaru";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);

    const result = await getPublicGalleryItems({ category, search, sortBy, page, limit });

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      },
      categories: result.categories,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal mengambil data galeri." },
      { status: 500 }
    );
  }
}
