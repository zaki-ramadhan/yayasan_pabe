import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updateArticleReaction } from "@/services/articleService";
import { checkRateLimit } from "@/lib/rateLimit";

const VALID_TYPES = new Set([
  "like",
  "unlike",
  "dislike",
  "undislike",
  "like_to_dislike",
  "dislike_to_like",
]);

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "article_reaction",
      limit: 60,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { slug, type } = await request.json();
    if (!slug) {
      return NextResponse.json({ success: false, message: "Slug is required" }, { status: 400 });
    }

    if (!VALID_TYPES.has(type)) {
      return NextResponse.json({ success: false, message: "Tipe reaksi tidak valid" }, { status: 400 });
    }

    const updated = await updateArticleReaction(slug, type);
    if (!updated) {
      return NextResponse.json({ success: false, message: "Artikel tidak ditemukan" }, { status: 404 });
    }

    revalidatePath("/artikel");
    revalidatePath(`/artikel/${slug}`);

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui reaksi artikel." },
      { status: 500 }
    );
  }
}
