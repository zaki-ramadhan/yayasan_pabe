"use client";

import { formatDate } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/table";

export function AdminFaqTableRow({ faq, onEdit, onDelete }) {
	return (
		<TableRow className="hover:bg-slate-50/70 transition-colors">
			{/* Question & Answer snippet */}
			<TableCell className="py-3 px-4 align-middle">
				<div className="space-y-0.5">
					<span className="text-sm font-medium text-slate-900 block leading-snug">
						{
							faq.question
						}
					</span>
					<p className="text-sm text-slate-500 line-clamp-1 font-normal leading-normal mt-0.5">
						{
							faq.answer
						}
					</p>
				</div>
			</TableCell>

			{/* Category Tag */}
			<TableCell className="w-36 py-3 px-4 whitespace-nowrap align-middle">
				<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/90 whitespace-nowrap">
					{faq.category ||
						"Umum"}
				</span>
			</TableCell>

			{/* Updated Date */}
			<TableCell className="w-36 py-3 px-4 whitespace-nowrap align-middle">
				<span className="text-sm font-normal text-slate-600 tabular-nums block">
					{formatDate(
						faq.updatedAt ||
							faq.createdAt,
					)}
				</span>
			</TableCell>

			{/* Actions */}
			<TableCell className="w-24 py-3 px-4 text-right whitespace-nowrap align-middle pr-4">
				<TableRowActions
					onEdit={() =>
						onEdit(
							faq,
						)
					}
					onDelete={() =>
						onDelete(
							faq,
						)
					}
					editTooltip={`Edit FAQ: ${faq.question}`}
					deleteTooltip={`Hapus FAQ: ${faq.question}`}
				/>
			</TableCell>
		</TableRow>
	);
}
