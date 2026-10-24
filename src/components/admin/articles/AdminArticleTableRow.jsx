"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function AdminArticleTableRow({
	article,
	onEdit,
	onDelete,
	isDeleting,
}) {
	const dateDisplay = article.publishedAt
		? new Date(
				article.publishedAt,
			).toLocaleDateString(
				"id-ID",
				{
					day: "numeric",
					month: "short",
					year: "numeric",
				},
			)
		: "-";

	return (
		<TableRow>
			<TableCell className="py-2.5 align-middle">
				<div className="w-12 h-9 rounded bg-slate-100 overflow-hidden relative border border-slate-200 shrink-0">
					<Image
						src={
							article.bannerUrl ||
							"/img/hero_card_1.jpeg"
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

			<TableCell className="py-2.5 align-middle">
				<div className="space-y-0.5">
					<span className="text-sm font-medium text-slate-900 block line-clamp-1">
						{
							article.title
						}
					</span>
					<div className="flex items-center gap-1 text-sm text-slate-500">
						<span>
							/
							{
								article.slug
							}
						</span>
						<Link
							href={`/artikel/${article.slug}`}
							target="_blank"
							title="Buka artikel di tab baru"
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
					title={
						article.category
					}
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

			<TableCell className="text-sm text-slate-600 py-2.5 whitespace-nowrap align-middle">
				{
					dateDisplay
				}
			</TableCell>

			<TableCell className="text-sm text-slate-700 py-2.5 text-center whitespace-nowrap font-medium align-middle">
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
