"use client";

import Link from "next/link";
import {
	ThumbsUp,
	ThumbsDown,
	Image as ImageIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { SafeImage } from "@/components/ui/safe-image";
import { HighlightText } from "@/components/shared/HighlightText";
import { ShareDropdown } from "@/components/shared/ShareDropdown";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Reusable Horizontal Mini Card for Articles (Side-by-Side Media Stack Card)
 * Used across Article Catalog, Home Page, and Related Articles sections.
 */
import { ArticleMiniCard } from "@/components/shared/ArticleMiniCard";

export { ArticleMiniCard };

export function ArticleCard({
	article,
	highlightQuery = "",
	className = "",
	isCompact = false,
}) {
	if (!article) return null;

	if (isCompact) {
		return (
			<ArticleMiniCard
				article={article}
				highlightQuery={highlightQuery}
				className={className}
			/>
		);
	}

	return (
		<Card
			className={cn(
				"p-3.5 sm:p-4 bg-white border-slate-300 hover:border-slate-400 transition-colors flex flex-col justify-between rounded-xl shadow-2xs group h-full",
				className,
			)}
		>
			{/* Top Section: Side-by-side Thumbnail + Content */}
			<div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start flex-1">
				{/* Left: Thumbnail with fixed aspect ratio / square size so it doesn't stretch vertically */}
				<div className="relative w-full aspect-[16/9] sm:aspect-square sm:w-32 md:w-36 sm:h-32 md:h-36 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
					{article.bannerUrl ? (
						<SafeImage
							src={article.bannerUrl}
							alt={article.title}
							fallbackText={article.category}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
							<ImageIcon className="w-8 h-8 text-slate-400 stroke-[1.5]" />
						</div>
					)}
				</div>

				{/* Right: Content (Category, Title, Excerpt, Tags) */}
				<div className="flex-1 flex flex-col justify-between min-w-0 space-y-1.5 w-full">
					<div className="space-y-1.5">
						{/* Category */}
						<div className="flex items-center justify-between gap-2">
							<span className="text-xs sm:text-sm font-semibold text-primary truncate">
								{article.category}
							</span>
						</div>

						{/* Title */}
						<Link href={`/artikel/${article.slug}`}>
							<h2 className="text-base sm:text-lg font-semibold text-slate-950 hover:text-primary hover:underline transition-colors leading-snug line-clamp-2">
								<HighlightText
									text={article.title}
									highlight={highlightQuery}
								/>
							</h2>
						</Link>

						{/* Excerpt */}
						<p className="text-xs sm:text-sm text-slate-700 line-clamp-2 leading-relaxed">
							{article.excerpt}
						</p>

						{/* Tags list (Readable size) */}
						{Array.isArray(article.tags) && article.tags.length > 0 && (
							<div className="flex items-center gap-1.5 flex-wrap pt-0.5">
								{article.tags.slice(0, 3).map((tag) => (
									<span
										key={tag}
										className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
									>
										#{tag}
									</span>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Bottom Metadata: Spans FULL width of the card under both thumbnail and content */}
			<div className="flex items-center text-xs text-slate-600 pt-2.5 sm:pt-3 border-t border-slate-200 mt-2.5 sm:mt-3 min-w-0 w-full justify-between flex-wrap gap-2">
				{/* Left: Author & Published Date */}
				<div className="flex items-center min-w-0 truncate">
					{article.author && (
						<>
							<span
								className="truncate font-medium text-slate-700 min-w-0"
								title={article.author}
							>
								{article.author}
							</span>
							<span className="mx-2 text-slate-300 shrink-0">|</span>
						</>
					)}
					<span className="shrink-0 whitespace-nowrap text-slate-600">
						{formatDate(article.publishedAt, {
							withDay: true,
							withTime: true,
						})}
					</span>
				</div>

				{/* Right: Like, Dislike, and Icon-Only Share Button */}
				<div className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-normal text-slate-600 shrink-0">
					<span
						className="flex items-center gap-1 text-slate-600"
						title={`${article.likeCount || 0} suka`}
					>
						<ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
						<span>{article.likeCount || 0}</span>
					</span>
					<span
						className="flex items-center gap-1 text-slate-600"
						title={`${article.dislikeCount || 0} tidak suka`}
					>
						<ThumbsDown className="w-3.5 h-3.5 text-slate-500" />
						<span>{article.dislikeCount || 0}</span>
					</span>

					<ShareDropdown
						url={`/artikel/${article.slug}`}
						title={article.title}
						variant="icon"
						align="end"
					/>
				</div>
			</div>
		</Card>
	);
}
