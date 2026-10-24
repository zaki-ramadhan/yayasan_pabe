"use client";

import Link from "next/link";
import {
	ExternalLink,
	MoreVertical,
	Edit2,
	Play,
	Pause,
	CheckCircle,
} from "lucide-react";
import { formatRupiah, calculateDaysLeft } from "@/lib/formatters";
import { Progress } from "@/components/ui/progress";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge, StatusBadge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function AdminProgramTableRow({ item, onEdit, onToggleStatus }) {
	const target = Number(item.targetAmount || 0);
	const collected = Number(item.collectedAmount || 0);
	const disbursed = Number(item.disbursedAmount || 0);
	const remaining = Math.max(0, collected - disbursed);
	const percent =
		target > 0
			? Math.min(
					100,
					Math.round(
						(collected /
							target) *
							100,
					),
				)
			: null;
	const daysLeft = item.endDate
		? calculateDaysLeft(
				item.endDate,
			)
		: null;

	return (
		<TableRow
			key={
				item.id
			}
			className="hover:bg-slate-50/70 transition-colors"
		>
			<TableCell className="space-y-1 py-3 align-middle">
				<span
					className="font-medium text-sm text-slate-900 block leading-snug line-clamp-2"
					title={item.title}
				>
					{item.title}
				</span>
				<span className="text-sm text-slate-500 block">
					Lokasi:{" "}
					{
						item.location || "-"
					}
				</span>
			</TableCell>

			<TableCell className="py-3 align-middle text-center whitespace-nowrap">
				<Badge
					variant="secondary"
					className="max-w-[130px] truncate"
					title={
						item.category
					}
				>
					{
						item.category
					}
				</Badge>
			</TableCell>

			<TableCell className="space-y-1.5 py-3 align-middle">
				<div className="flex items-center justify-between text-sm">
					<span className="font-medium text-slate-900">
						{formatRupiah(
							collected,
						)}
					</span>
					{target >
						0 && (
						<span className="font-medium text-slate-600">
							{
								percent
							}
							%
						</span>
					)}
				</div>
				{target >
					0 && (
					<>
						<Progress
							value={
								percent
							}
							className="h-1.5"
						/>
						<span className="text-sm text-slate-500 block">
							Target:{" "}
							{formatRupiah(
								target,
							)}
						</span>
					</>
				)}
			</TableCell>

			<TableCell className="text-sm text-slate-700 py-3 align-middle whitespace-nowrap">
				<span className="font-medium text-slate-900">
					{
						item.donorCount
					}
				</span>{" "}
				donatur
				{daysLeft !==
					null && (
					<span className="text-sm text-slate-500 block mt-0.5">
						{daysLeft >
						0
							? `${daysLeft} hari lagi`
							: "Waktu berakhir"}
					</span>
				)}
			</TableCell>

			<TableCell className="space-y-0.5 py-3 align-middle whitespace-nowrap">
				{disbursed >
				0 ? (
					<>
						<div className="font-medium text-sm text-slate-900">
							{formatRupiah(
								disbursed,
							)}
						</div>
						<span className="text-sm text-slate-500 block">
							Sisa
							kas:{" "}
							{formatRupiah(
								remaining,
							)}
						</span>
					</>
				) : (
					<>
						<span className="text-sm text-slate-400 block font-normal">
							Belum
							disalurkan
						</span>
						<span className="text-sm text-slate-500 block">
							Kas
							utuh:{" "}
							{formatRupiah(
								collected,
							)}
						</span>
					</>
				)}
			</TableCell>

			<TableCell className="py-3.5 align-middle text-center whitespace-nowrap">
				<StatusBadge
					status={
						item.status
					}
					label={
						item.status ===
						"PAUSED"
							? "Terjeda"
							: undefined
					}
				/>
			</TableCell>

			<TableCell className="text-right py-3.5 align-middle">
				<DropdownMenu>
					<DropdownMenuTrigger className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer outline-none">
						<MoreVertical className="w-4.5 h-4.5" />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-52 p-1"
					>
						<DropdownMenuItem
							onClick={() =>
								onEdit(
									item,
								)
							}
							className="text-sm py-2 cursor-pointer flex items-center gap-2"
						>
							<Edit2 className="w-4 h-4 text-slate-600" />
							<span>
								Edit
								Program
							</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							asChild
						>
							<Link
								href={`/campaign/${item.slug}`}
								target="_blank"
								rel="noopener noreferrer"
								className="text-sm py-2 cursor-pointer flex items-center gap-2"
							>
								<ExternalLink className="w-4 h-4 text-slate-600" />
								<span>
									Buka
									di
									Website
								</span>
							</Link>
						</DropdownMenuItem>

						<DropdownMenuSeparator />

						{item.status ===
						"ACTIVE" ? (
							<DropdownMenuItem
								onClick={() =>
									onToggleStatus(
										item.id,
										"PAUSED",
									)
								}
								className="text-sm py-2 cursor-pointer text-amber-700 flex items-center gap-2"
							>
								<Pause className="w-4 h-4" />
								<span>
									Jeda
									Penggalangan
								</span>
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								onClick={() =>
									onToggleStatus(
										item.id,
										"ACTIVE",
									)
								}
								className="text-sm py-2 cursor-pointer text-emerald-700 flex items-center gap-2"
							>
								<Play className="w-4 h-4" />
								<span>
									Aktifkan
									Kembali
								</span>
							</DropdownMenuItem>
						)}

						{item.status !==
							"COMPLETED" && (
							<DropdownMenuItem
								onClick={() =>
									onToggleStatus(
										item.id,
										"COMPLETED",
									)
								}
								className="text-sm py-2 cursor-pointer text-slate-700 flex items-center gap-2"
							>
								<CheckCircle className="w-4 h-4" />
								<span>
									Tandai
									Selesai
								</span>
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</TableCell>
		</TableRow>
	);
}
