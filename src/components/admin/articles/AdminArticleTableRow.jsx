"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
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
				isSelected ? "bg-emerald-50/60 hover:bg-emerald-50/80" : ""
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
				<div className="w-12 h-9 rounded bg-slate-100 overflow-hidden relative border border-slate-200 shrink-0">
					<Image
						src={
							article.bannerUrl ||
							"/img/branding/logo-ypabe.webp"
						}
						alt={
							article.title
						}
						fill
						className="object-cover"
						unoptimized
					/>
				</div>
			</TableCell>

			<TableCell className="py-2.5 align-middle min-w-[280px] sm:min-w-[340px] max-w-lg">
				<div className="space-y-0.5">
					<span
						className="text-sm font-medium text-slate-900 block line-clamp-2 leading-snug"
					>
						{article.title}
					</span>
					<div className="flex items-center gap-1 text-xs text-slate-500 font-normal">
						<span>
							/
							{
								article.slug
							}
						</span>
						<Link
							href={`/artikel/${article.slug}`}
							target="_blank" aria-label="Buka artikel di tab baru"
							className="text-slate-400 hover:text-primary transition-colors"
						>
							<ExternalLink className="w-3.5 h-3.5 ml-0.5" />
						</Link>
					</div>
				</div>
			</TableCell>

			<TableCell className="py-2.5 text-center align-middle">
				<Badge
					variant="secondary"
					className="max-w-[140px] truncate"
				>
					{
						article.category
					}
				</Badge>
			</TableCell>

			<TableCell className="text-sm text-slate-600 py-2.5 align-middle">
				{
					article.author
				}
			</TableCell>

			<TableCell className="text-sm text-slate-600 py-2.5 whitespace-nowrap align-middle text-center tabular-nums">
				{
					dateDisplay
				}
			</TableCell>

			<TableCell className="text-sm text-slate-700 py-2.5 text-center whitespace-nowrap font-medium align-middle tabular-nums">
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
