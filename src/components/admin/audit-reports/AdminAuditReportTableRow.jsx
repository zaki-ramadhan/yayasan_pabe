"use client";

import { ShieldCheck, Download } from "lucide-react";
import { formatRupiah, formatNumber } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/table";

export function AdminAuditReportTableRow({ item, onEdit, onDelete }) {
	return (
		<TableRow className="hover:bg-slate-50/70 transition-colors">
			<TableCell className="text-center py-3.5 align-middle">
				<span className="font-medium text-sm text-slate-900 block">
					{
						item.year
					}
				</span>
			</TableCell>

			<TableCell className="py-3.5 align-middle space-y-1">
				<span className="font-medium text-sm text-slate-900 block leading-tight">
					{
						item.auditorName
					}
				</span>
				<span className="text-sm font-normal text-slate-500 block leading-normal">
					{
						item.title
					}
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

			<TableCell className="text-center py-3.5 align-middle">
				<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/90 whitespace-nowrap">
					<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
					<span>
						{item.opinionStatus ===
						"WTP"
							? "Wajar (WTP)"
							: item.opinionStatus}
					</span>
				</span>
			</TableCell>

			<TableCell className="py-3.5 align-middle space-y-1">
				<div className="flex items-center justify-between text-sm font-normal">
					<span className="text-slate-500">
						Masuk:
					</span>
					<span className="font-medium text-slate-900 ml-2">
						{formatRupiah(
							item.totalFundsIn,
						)}
					</span>
				</div>
				<div className="flex items-center justify-between text-sm font-normal">
					<span className="text-slate-500">
						Salur:
					</span>
					<span className="font-medium text-emerald-700 ml-2">
						{formatRupiah(
							item.totalFundsOut,
						)}
					</span>
				</div>
			</TableCell>

			<TableCell className="text-center py-3.5 align-middle space-y-0.5">
				<span className="text-sm font-medium text-slate-900 block">
					{formatNumber(
						item.beneficiaryCount,
					)}{" "}
					jiwa
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
