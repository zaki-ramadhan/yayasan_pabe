"use client";

import Image from "next/image";
import { Camera, Video } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { isVideoUrl } from "@/lib/galleryGroupHelper";

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

			{/* Judul & Media */}
			<TableCell className="space-y-1.5 py-3 align-middle">
				<p
					className="font-normal text-sm text-slate-900 leading-snug line-clamp-2"
					title={item.content || item.title}
				>
					{item.title}
				</p>
				{(() => {
					const mediaList = Array.isArray(item.images) ? item.images : [];
					if (mediaList.length === 0) return null;
					const videoCount = mediaList.filter((u) => isVideoUrl(u)).length;
					const photoCount = mediaList.length - videoCount;

					return (
						<div className="flex items-center gap-1.5 text-2xs text-slate-500 font-normal">
							{photoCount > 0 && (
								<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
									<Camera className="w-3 h-3 text-slate-500" />
									<span>{photoCount} Foto</span>
								</span>
							)}
							{videoCount > 0 && (
								<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium border border-emerald-200/50">
									<Video className="w-3 h-3 text-emerald-600" />
									<span>{videoCount} Video</span>
								</span>
							)}
						</div>
					);
				})()}
			</TableCell>

			{/* Tanggal */}
			<TableCell className="text-sm text-slate-600 py-3 align-middle text-center whitespace-nowrap tabular-nums">
				{formatDate(
					item.date,
				)}
			</TableCell>

			{/* Nominal */}
			<TableCell className="text-right font-medium text-sm text-slate-900 py-3 align-middle whitespace-nowrap tabular-nums">
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
