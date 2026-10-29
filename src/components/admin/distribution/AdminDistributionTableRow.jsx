"use client";

import Image from "next/image";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";

export function AdminDistributionTableRow({
	item,
	isSelected = false,
	onToggleSelect,
	onEdit,
	onDelete,
}) {
	return (
		<TableRow
			data-state={isSelected ? "selected" : undefined}
			className={`transition-colors ${
				isSelected ? "bg-emerald-50/60" : "hover:bg-slate-50/70"
			}`}
		>
			{/* Checkbox Pemilihan */}
			<TableCell className="w-12 px-4 py-3 align-middle">
				<Checkbox
					checked={isSelected}
					onCheckedChange={onToggleSelect}
					aria-label={`Pilih data penyaluran ${item.title}`}
				/>
			</TableCell>

			{/* Program Donasi Asal */}
			<TableCell className="w-72 py-3 align-middle">
				<div className="flex items-center gap-2.5">
					<div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden relative border border-slate-200 shrink-0">
						<Image
							src={
								item.campaignBannerUrl ||
								"/img/branding/logo-ypabe.webp"
							}
							alt={
								item.campaignTitle ||
								"Program donasi"
							}
							fill
							className="object-cover"
							unoptimized
						/>
					</div>
					<span className="font-medium text-sm text-slate-900 block line-clamp-2 leading-snug">
						{
							item.campaignTitle
						}
					</span>
				</div>
			</TableCell>

			{/* Judul & Konten */}
			<TableCell className="space-y-1 py-3 align-middle">
				<span
					className="font-medium text-sm text-slate-900 block leading-snug line-clamp-2"
					title={item.title}
				>
					{item.title}
				</span>
				{item.content && (
					<p className="text-sm text-slate-500 line-clamp-2 max-w-xl leading-relaxed font-normal mt-0.5">
						{
							item.content
						}
					</p>
				)}
			</TableCell>

			{/* Tanggal */}
			<TableCell className="text-sm text-slate-600 py-3 align-middle whitespace-nowrap">
				{formatDate(
					item.date,
				)}
			</TableCell>

			{/* Nominal */}
			<TableCell className="text-right font-medium text-sm text-slate-900 py-3 align-middle whitespace-nowrap">
				{formatRupiah(
					item.disbursedAmount,
				)}
			</TableCell>

			{/* Aksi */}
			<TableCell className="text-right py-3 whitespace-nowrap align-middle pr-4">
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
					editTooltip={`Edit: ${item.title}`}
					deleteTooltip={`Hapus: ${item.title}`}
				/>
			</TableCell>
		</TableRow>
	);
}
