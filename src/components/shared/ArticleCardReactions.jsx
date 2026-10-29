"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useArticleReaction } from "@/hooks/useArticleReaction";
import { cn } from "@/lib/utils";

export function ArticleCardReactions({
  slug,
  articleId,
  initialLikes = 0,
  initialDislikes = 0,
  className,
}) {
  const {
    likes,
    dislikes,
    hasLiked,
    hasDisliked,
    handleToggleLike,
    handleToggleDislike,
  } = useArticleReaction({
    slug,
    articleId,
    initialLikes,
    initialDislikes,
  });

  return (
    <div className={cn("flex items-center gap-2 sm:gap-2.5", className)}>
      {/* Tombol Suka */}
      <button
        type="button"
        onClick={handleToggleLike}
        className={cn(
          "inline-flex items-center gap-1 text-xs sm:text-sm font-normal transition-colors py-0.5 px-1 rounded hover:bg-slate-100 active:scale-95 focus:outline-hidden",
          hasLiked
            ? "text-blue-700 font-medium"
            : "text-slate-600 hover:text-slate-900"
        )}
        aria-label={`${likes} suka`}
      >
        <ThumbsUp
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            hasLiked ? "text-blue-700 fill-blue-700" : "text-slate-500"
          )}
        />
        <span>{likes}</span>
      </button>

      {/* Tombol Tidak Suka */}
      <button
        type="button"
        onClick={handleToggleDislike}
        className={cn(
          "inline-flex items-center gap-1 text-xs sm:text-sm font-normal transition-colors py-0.5 px-1 rounded hover:bg-slate-100 active:scale-95 focus:outline-hidden",
          hasDisliked
            ? "text-rose-700 font-medium"
            : "text-slate-600 hover:text-slate-900"
        )}
        aria-label={`${dislikes} tidak suka`}
      >
        <ThumbsDown
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            hasDisliked ? "text-rose-700 fill-rose-700" : "text-slate-500"
          )}
        />
        <span>{dislikes}</span>
      </button>
    </div>
  );
}
