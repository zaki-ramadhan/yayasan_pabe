"use client";

import { LikeIcon as LikeLine } from "@solar-icons/react/line-duotone/like";
import { LikeIcon as LikeBold } from "@solar-icons/react/bold-duotone/like";
import { DislikeIcon as DislikeLine } from "@solar-icons/react/line-duotone/dislike";
import { DislikeIcon as DislikeBold } from "@solar-icons/react/bold-duotone/dislike";
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
        {hasLiked ? (
          <LikeBold className="w-3.5 h-3.5 text-blue-700" />
        ) : (
          <LikeLine className="w-3.5 h-3.5 text-slate-500" />
        )}
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
        {hasDisliked ? (
          <DislikeBold className="w-3.5 h-3.5 text-rose-700" />
        ) : (
          <DislikeLine className="w-3.5 h-3.5 text-slate-500" />
        )}
        <span>{dislikes}</span>
      </button>
    </div>
  );
}
