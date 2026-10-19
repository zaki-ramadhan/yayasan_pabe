import { NextResponse } from "next/server";
import { updateArticleReaction } from "@/services/articleService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const rateLimitBlocked = checkRateLimit(request, {
      action: "article_reaction",
      limit: 30,
      windowMs: 60000,
    });
    if (rateLimitBlocked) return rateLimitBlocked;

    const { slug, type } = await request.json();
    if (!slug) {
      return NextResponse.json({ success: false, message: "Slug is required" }, { status: 400 });
    }
    const updated = await updateArticleReaction(slug, type);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Gagal memperbarui reaksi artikel." },
      { status: 500 }
    );
  }
}
