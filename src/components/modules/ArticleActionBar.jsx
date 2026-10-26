"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ShareDropdown } from "@/components/shared/ShareDropdown";
import { useArticleReaction } from "@/hooks/useArticleReaction";
import { cn } from "@/lib/utils";

export function ArticleActionBar({
	articleId,
	slug,
	initialLikes = 0,
	initialDislikes = 0,
	title = "",
	bordered = true,
	className = "",
}) {
	const targetSlug = slug || articleId;
	const {
		likes,
		dislikes,
		hasLiked,
		hasDisliked,
		handleToggleLike,
		handleToggleDislike,
	} = useArticleReaction({
		slug: targetSlug,
		articleId,
		initialLikes,
		initialDislikes,
	});

	return (
		<div
			className={cn(
				"flex items-center justify-between text-sm gap-3",
				bordered ? "py-3 border-y border-slate-200" : "",
				className,
			)}
		>
			{/* Action Buttons: Like + Dislike + Share (Sejajar) */}
			<div className="flex items-center gap-2">
				{/* Like Button */}
				<button
					type="button"
					onClick={handleToggleLike}
					className={cn(
						"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors cursor-pointer",
						hasLiked
							? "bg-blue-50 border-blue-300 text-blue-700"
							: "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900",
					)}
					aria-label={hasLiked ? "Batalkan suka" : "Sukai artikel"}
					title={hasLiked ? "Disukai" : "Sukai"}
				>
					<ThumbsUp
						className={cn(
							"w-4 h-4 transition-transform active:scale-125",
							hasLiked
								? "text-blue-700 fill-blue-700"
								: "text-slate-500",
						)}
					/>
					<span className={cn("font-semibold", hasLiked ? "text-blue-700" : "text-slate-800")}>
						{likes}
					</span>
				</button>

				{/* Dislike Button */}
				<button
					type="button"
					onClick={handleToggleDislike}
					className={cn(
						"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors cursor-pointer",
						hasDisliked
							? "bg-rose-50 border-rose-300 text-rose-700"
							: "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900",
					)}
					aria-label={
						hasDisliked
							? "Batalkan tidak suka"
							: "Tidak sukai artikel"
					}
					title={hasDisliked ? "Tidak disukai" : "Tidak suka"}
				>
					<ThumbsDown
						className={cn(
							"w-4 h-4 transition-transform active:scale-125",
							hasDisliked
								? "text-rose-700 fill-rose-700"
								: "text-slate-500",
						)}
					/>
					<span className={cn("font-semibold", hasDisliked ? "text-rose-700" : "text-slate-800")}>
						{dislikes}
					</span>
				</button>

				<ShareDropdown
					url={targetSlug ? `/artikel/${targetSlug}` : undefined}
					title={title}
					variant="button"
					align="start"
				/>
			</div>
		</div>
	);
}
