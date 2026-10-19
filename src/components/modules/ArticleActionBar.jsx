"use client";

import { useState, useMemo, useSyncExternalStore, useId, useRef, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ShareDropdown } from "@/components/shared/ShareDropdown";
import { toast } from "@/hooks/use-toast";
import { safeFetch } from "@/lib/safeFetch";
import { cn } from "@/lib/utils";

const LIKE_STORAGE_KEY = "pabe_liked_articles";
const DISLIKE_STORAGE_KEY = "pabe_disliked_articles";
const SYNC_EVENT = "pabe_article_reaction_sync";

function subscribeReactions(callback) {
	window.addEventListener("storage", callback);
	window.addEventListener(SYNC_EVENT, callback);
	return () => {
		window.removeEventListener("storage", callback);
		window.removeEventListener(SYNC_EVENT, callback);
	};
}

function getLikesSnapshot() {
	return localStorage.getItem(LIKE_STORAGE_KEY) || localStorage.getItem("ygsm_liked_articles") || "[]";
}

function getDislikesSnapshot() {
	return localStorage.getItem(DISLIKE_STORAGE_KEY) || localStorage.getItem("ygsm_disliked_articles") || "[]";
}

function getServerSnapshot() {
	return "[]";
}

export function ArticleActionBar({
	articleId,
	slug,
	initialLikes = 0,
	initialDislikes = 0,
	title = "",
	bordered = true,
	className = "",
}) {
	const instanceId = useId();
	const [likes, setLikes] = useState(initialLikes);
	const [dislikes, setDislikes] = useState(initialDislikes);
	const targetSlug = slug || articleId;
	const reactionDebounceRef = useRef(null);

	useEffect(() => {
		return () => {
			if (reactionDebounceRef.current) {
				clearTimeout(reactionDebounceRef.current);
			}
		};
	}, []);

	const scheduleServerReaction = (targetArticleSlug, type) => {
		if (reactionDebounceRef.current) {
			clearTimeout(reactionDebounceRef.current);
		}
		reactionDebounceRef.current = setTimeout(async () => {
			try {
				const res = await safeFetch("/api/articles/reaction", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ slug: targetArticleSlug, type }),
				});
				if (!res.ok) {
					toast({
						variant: "destructive",
						title: "Gagal Menyimpan Reaksi",
						description: "Koneksi terputus. Reaksi Anda belum tersimpan di server.",
					});
				}
			} catch {
				toast({
					variant: "destructive",
					title: "Gagal Menyimpan Reaksi",
					description: "Koneksi internet bermasalah. Reaksi belum tersimpan.",
				});
			}
		}, 400);
	};

	const storedLikesRaw = useSyncExternalStore(subscribeReactions, getLikesSnapshot, getServerSnapshot);
	const storedDislikesRaw = useSyncExternalStore(subscribeReactions, getDislikesSnapshot, getServerSnapshot);

	const hasLiked = useMemo(() => {
		try {
			const arr = JSON.parse(storedLikesRaw);
			return Array.isArray(arr) && (arr.includes(articleId) || arr.includes(targetSlug));
		} catch {
			return false;
		}
	}, [storedLikesRaw, articleId, targetSlug]);

	const hasDisliked = useMemo(() => {
		try {
			const arr = JSON.parse(storedDislikesRaw);
			return Array.isArray(arr) && (arr.includes(articleId) || arr.includes(targetSlug));
		} catch {
			return false;
		}
	}, [storedDislikesRaw, articleId, targetSlug]);

	const handleToggleLike = () => {
		try {
			const storedLikes = JSON.parse(
				localStorage.getItem(LIKE_STORAGE_KEY) || "[]",
			);
			const storedDislikes = JSON.parse(
				localStorage.getItem(DISLIKE_STORAGE_KEY) || "[]",
			);

			const nextLiked = !hasLiked;
			const updatedLikes = nextLiked
				? [...storedLikes, targetSlug]
				: storedLikes.filter((id) => id !== targetSlug && id !== articleId);

			const updatedDislikes = hasDisliked
				? storedDislikes.filter((id) => id !== targetSlug && id !== articleId)
				: storedDislikes;

			localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(updatedLikes));
			localStorage.setItem(
				DISLIKE_STORAGE_KEY,
				JSON.stringify(updatedDislikes),
			);

			const likeDelta = nextLiked ? 1 : -1;
			const dislikeDelta = hasDisliked ? -1 : 0;

			setLikes((prev) => Math.max(0, prev + likeDelta));
			if (hasDisliked) {
				setDislikes((prev) => Math.max(0, prev - 1));
			}

			if (nextLiked && targetSlug) {
				scheduleServerReaction(targetSlug, "like");
			}

			window.dispatchEvent(
				new CustomEvent(SYNC_EVENT, {
					detail: {
						sourceId: instanceId,
						articleId: targetSlug,
						hasLiked: nextLiked,
						likeDelta,
						hasDisliked: false,
						dislikeDelta,
					},
				}),
			);
		} catch {
			// ignore storage error
		}
	};

	const handleToggleDislike = () => {
		try {
			const storedLikes = JSON.parse(
				localStorage.getItem(LIKE_STORAGE_KEY) || "[]",
			);
			const storedDislikes = JSON.parse(
				localStorage.getItem(DISLIKE_STORAGE_KEY) || "[]",
			);

			const nextDisliked = !hasDisliked;
			const updatedDislikes = nextDisliked
				? [...storedDislikes, targetSlug]
				: storedDislikes.filter((id) => id !== targetSlug && id !== articleId);

			const updatedLikes = hasLiked
				? storedLikes.filter((id) => id !== targetSlug && id !== articleId)
				: storedLikes;

			localStorage.setItem(LIKE_STORAGE_KEY, JSON.stringify(updatedLikes));
			localStorage.setItem(
				DISLIKE_STORAGE_KEY,
				JSON.stringify(updatedDislikes),
			);

			const dislikeDelta = nextDisliked ? 1 : -1;
			const likeDelta = hasLiked ? -1 : 0;

			setDislikes((prev) => Math.max(0, prev + dislikeDelta));
			if (hasLiked) {
				setLikes((prev) => Math.max(0, prev - 1));
			}

			if (nextDisliked && targetSlug) {
				scheduleServerReaction(targetSlug, "dislike");
			}

			window.dispatchEvent(
				new CustomEvent(SYNC_EVENT, {
					detail: {
						sourceId: instanceId,
						articleId: targetSlug,
						hasDisliked: nextDisliked,
						dislikeDelta,
						hasLiked: false,
						likeDelta,
					},
				}),
			);
		} catch {
			// ignore storage error
		}
	};


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
							? "bg-slate-100 border-slate-400 text-slate-900"
							: "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900",
					)}
					aria-label={hasLiked ? "Batalkan suka" : "Sukai artikel"}
					title={hasLiked ? "Disukai" : "Sukai"}
				>
					<ThumbsUp
						className={cn(
							"w-4 h-4 transition-transform active:scale-125",
							hasLiked
								? "fill-slate-800 text-slate-800"
								: "text-slate-500",
						)}
					/>
					<span className="font-semibold text-slate-800">{likes}</span>
				</button>

				{/* Dislike Button */}
				<button
					type="button"
					onClick={handleToggleDislike}
					className={cn(
						"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors cursor-pointer",
						hasDisliked
							? "bg-slate-100 border-slate-400 text-slate-900"
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
								? "fill-slate-800 text-slate-800"
								: "text-slate-500",
						)}
					/>
					<span className="font-semibold text-slate-800">
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
