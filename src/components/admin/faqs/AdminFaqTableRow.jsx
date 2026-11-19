"use client";

import { formatDate } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Badge } from "@/components/ui/Badge";

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
      <TableCell className="w-12 text-center py-3 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(faq.id)}
          aria-label={`Pilih FAQ: ${faq.question}`}
        />
      </TableCell>

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

			<TableCell className="w-36 py-3 px-4 whitespace-nowrap align-middle text-center">
				<Badge variant="secondary">
					{faq.category || "Umum"}
				</Badge>
			</TableCell>

			<TableCell className="w-36 py-3 px-4 whitespace-nowrap align-middle text-center">
				<span className="text-sm font-normal text-slate-600 tabular-nums block">
					{formatDate(
						faq.updatedAt ||
							faq.createdAt,
					)}
				</span>
			</TableCell>

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
