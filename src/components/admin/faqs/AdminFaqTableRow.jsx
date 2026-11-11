"use client";

import { formatDate } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";

export function AdminFaqTableRow({
  faq,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
}) {
  return (
    <TableRow
      className={`hover:bg-slate-50/70 transition-colors ${
        isSelected ? "bg-primary/5 hover:bg-primary/10" : ""
      }`}
    >
      {/* 0. Selection Checkbox */}
      <TableCell className="w-12 text-center py-3 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(faq.id)}
          aria-label={`Pilih FAQ: ${faq.question}`}
        />
      </TableCell>

      {/* Question & Answer snippet */}
			<TableCell className="py-3 px-4 align-middle">
				<div className="space-y-0.5">
					<span
						className="text-sm font-medium text-slate-900 block leading-snug line-clamp-2"
					>
						{faq.question}
					</span>
					<p className="text-sm text-slate-500 line-clamp-1 font-normal leading-normal mt-0.5">
						{
							faq.answer
						}
					</p>
				</div>
			</TableCell>

			{/* Category Tag */}
			<TableCell className="w-36 py-3 px-4 whitespace-nowrap align-middle text-center">
				<span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-normal bg-slate-100 text-slate-700 border border-slate-200/90 whitespace-nowrap max-w-[130px] truncate">
					{faq.category ||
						"Umum"}
				</span>
			</TableCell>

			{/* Updated Date */}
			<TableCell className="w-36 py-3 px-4 whitespace-nowrap align-middle text-center">
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
