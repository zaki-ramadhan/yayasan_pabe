"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/formatters";

export function AdminArticleTableRow({
	article,
	isSelected = false,
	onToggleSelect,
	onEdit,
	onDelete,
	isDeleting,
}) {
	const dateDisplay = formatDate(article.publishedAt, { month: "short" });

	return (
		<TableRow
			className={`hover:bg-slate-50/70 transition-colors ${
				isSelected ? "bg-primary/5 hover:bg-primary/10" : ""
			}`}
		>
			{/* 0. Selection Checkbox */}
			<TableCell className="w-12 text-center py-2.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
				<Checkbox
					checked={isSelected}
					onCheckedChange={() => onToggleSelect?.(article.id)}
					aria-label={`Pilih artikel: ${article.title}`}
				/>
			</TableCell>

			<TableCell className="py-2.5 align-middle">
				<div className="w-12 h-9 rounded bg-white overflow-hidden relative border border-slate-200 shrink-0">
					<SafeImage
						src={article.bannerUrl}
						alt={article.title}
						sizes="48px"
					/>
				</div>
			</TableCell>

			<TableCell className="py-2.5 align-middle min-w-[280px] sm:min-w-[340px] max-w-lg">
				<Link
					href={`/artikel/${article.slug}`}
					target="_blank"
					className="text-sm font-medium text-slate-900 hover:text-primary hover:underline line-clamp-2 leading-snug cursor-pointer transition-colors"
					aria-label={`Buka artikel: ${article.title}`}
				>
					{article.title}
				</Link>
			</TableCell>

			<TableCell className="w-36 py-2.5 text-center align-middle whitespace-nowrap">
				<Badge
					variant="secondary"
					className="max-w-[130px] truncate"
				>
					{
						article.category
					}
				</Badge>
			</TableCell>

			<TableCell className="w-60 text-sm text-slate-600 py-2.5 align-middle">
				<span
					className="line-clamp-2 leading-snug font-normal overflow-hidden"
					style={{
						display: "-webkit-box",
						WebkitLineClamp: 2,
						WebkitBoxOrient: "vertical",
						overflow: "hidden",
					}}
				>
					{
						article.author
					}
				</span>
			</TableCell>

			<TableCell className="text-sm text-slate-600 py-2.5 whitespace-nowrap align-middle text-center tabular-nums">
				{
					dateDisplay
				}
			</TableCell>

			<TableCell className="text-sm text-slate-600 py-2.5 text-center whitespace-nowrap font-normal align-middle tabular-nums">
				{
					article.likeCount
				}{" "}
				Suka
			</TableCell>

			<TableCell className="text-right py-2.5 whitespace-nowrap align-middle pr-4">
				<TableRowActions
					onEdit={() =>
						onEdit(
							article,
						)
					}
					onDelete={() =>
						onDelete(
							article.id,
							article.title,
						)
					}
					disabled={
						isDeleting
					}
					editTooltip="Edit artikel"
					deleteTooltip="Hapus artikel"
				/>
			</TableCell>
		</TableRow>
	);
}
