"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { Camera, Video, MapPin } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { isVideoUrl } from "@/lib/galleryGroupHelper";
import { getCampaignDetailHref } from "@/lib/zisFilter";

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
				isSelected ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-slate-50/70"
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
					<div className="w-10 h-10 rounded-md bg-white overflow-hidden relative border border-slate-200 shrink-0">
						<SafeImage
							src={item.campaignBannerUrl}
							alt={item.campaignTitle || "Program donasi"}
							sizes="40px"
						/>
					</div>
					<div className="min-w-0 space-y-0.5">
						{item.campaignSlug ? (
											<Link
												href={getCampaignDetailHref(item.campaignSlug)}
												target="_blank"
												className="font-medium text-sm text-slate-900 hover:text-primary hover:underline block line-clamp-2 leading-snug cursor-pointer transition-colors overflow-hidden"
												aria-label={`Buka program: ${item.campaignTitle}`}
												style={{
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
												}}
											>
												{item.campaignTitle}
											</Link>
										) : (
											<span
												className="font-medium text-sm text-slate-900 block line-clamp-2 leading-snug overflow-hidden"
												style={{
													display: "-webkit-box",
													WebkitLineClamp: 2,
													WebkitBoxOrient: "vertical",
													overflow: "hidden",
												}}
											>
												{item.campaignTitle}
											</span>
										)}
						{item.location && (
							<span className="inline-flex items-center gap-1 text-sm text-slate-500 font-normal">
								<MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
								<span className="truncate max-w-[160px]">{item.location}</span>
							</span>
						)}
					</div>
				</div>
			</TableCell>

			{/* Judul & Media */}
			<TableCell className="space-y-1.5 py-3 align-middle">
				<p className="font-normal text-sm text-slate-800 leading-snug line-clamp-2">
					{item.title}
				</p>
				{(() => {
					const mediaList = Array.isArray(item.images) ? item.images : [];
					if (mediaList.length === 0) return null;
					const videoCount = mediaList.filter((u) => isVideoUrl(u)).length;
					const photoCount = mediaList.length - videoCount;

					return (
						<div className="flex items-center gap-1.5 text-sm text-slate-500 font-normal">
							{photoCount > 0 && (
								<span
									title={`${photoCount} Foto`}
									className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-normal max-w-[120px] truncate whitespace-nowrap"
								>
									<Camera className="w-3.5 h-3.5 text-slate-500 shrink-0" />
									<span className="truncate">{photoCount} Foto</span>
								</span>
							)}
							{videoCount > 0 && (
								<span
									title={`${videoCount} Video`}
									className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-normal border border-emerald-200/50 max-w-[120px] truncate whitespace-nowrap"
								>
									<Video className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
									<span className="truncate">{videoCount} Video</span>
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
