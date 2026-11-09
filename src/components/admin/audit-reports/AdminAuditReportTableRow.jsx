"use client";

import { Download } from "lucide-react";
import { formatRupiah, formatNumber, formatCompactRupiah } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";

export function AdminAuditReportTableRow({
  item,
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
      <TableCell className="w-12 text-center py-3.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(item.id)}
          aria-label={`Pilih laporan tahun ${item.year}`}
        />
      </TableCell>

      <TableCell className="text-center py-3.5 align-middle">
				<span className="font-medium text-sm text-slate-900 block">
					{
						item.year
					}
				</span>
			</TableCell>

			<TableCell className="py-3.5 align-middle space-y-1 min-w-[280px] sm:min-w-[360px] max-w-lg">
				<span
					className="font-medium text-sm text-slate-900 block leading-tight line-clamp-1"
				>
					{item.auditorName}
				</span>
				<span
					className="text-xs font-normal text-slate-500 block leading-normal line-clamp-2"
				>
					{item.title}
				</span>
				{item.pdfUrl && (
					<a
						href={
							item.pdfUrl
						}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-normal pt-0.5"
					>
						<Download className="w-3.5 h-3.5" />
						<span>
							Unduh
							PDF
						</span>
					</a>
				)}
			</TableCell>

			<TableCell className="py-3.5 align-middle space-y-1">
				<div className="flex items-center justify-between text-sm font-normal">
					<span className="text-slate-500">
						Masuk:
					</span>
					<span className="font-medium text-slate-900 ml-2 tabular-nums">
						{formatCompactRupiah(
							item.totalFundsIn,
							2,
							{ short: true }
						)}
					</span>
				</div>
				<div className="flex items-center justify-between text-sm font-normal">
					<span className="text-slate-500">
						Tersalurkan:
					</span>
					<span className="font-medium text-emerald-700 ml-2 tabular-nums">
						{formatCompactRupiah(
							item.totalFundsOut,
							2,
							{ short: true }
						)}
					</span>
				</div>
			</TableCell>

			<TableCell className="text-center py-3.5 align-middle space-y-0.5">
				<span className="text-sm font-medium text-slate-900 block">
					{formatNumber(
						item.beneficiaryCount,
					)}{" "}
					orang
				</span>
				<span className="text-sm font-normal text-slate-500 block">
					Rasio
					op:{" "}
					{item.operationalRatio ||
						"-"}
				</span>
			</TableCell>

			<TableCell className="text-right py-3.5 align-middle pr-4">
				<TableRowActions
					onEdit={() =>
						onEdit(
							item,
						)
					}
					onDelete={() =>
						onDelete(
							item,
						)
					}
					editTooltip="Edit laporan"
					deleteTooltip="Hapus laporan"
				/>
			</TableCell>
		</TableRow>
	);
}
