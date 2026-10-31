"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDeadlineDate } from "@/lib/formatters";
import { formatWorkplace } from "@/data/careers";

export function AdminCareerTableRow({
	job,
	isSelected = false,
	onToggleSelect,
	onOpenApplicants,
	onToggleStatus,
	onEdit,
	onDelete,
	isDeleting,
}) {
	return (
		<TableRow
			key={job.id}
			className={`hover:bg-slate-50/70 transition-colors ${
				isSelected ? "bg-emerald-50/60 hover:bg-emerald-50/80" : ""
			}`}
		>
			{/* 0. Selection Checkbox */}
			<TableCell className="w-12 text-center py-3 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
				<Checkbox
					checked={isSelected}
					onCheckedChange={() => onToggleSelect?.(job.id)}
					aria-label={`Pilih lowongan: ${job.title}`}
				/>
			</TableCell>

			<TableCell className="min-w-[260px] w-64 py-3 align-middle">
				<div className="space-y-0.5">
					<span
						className="text-sm font-medium text-slate-900 block leading-snug line-clamp-2"
					>
						{job.title}
					</span>
					<span className="text-xs text-slate-500 font-normal">
						{job.jobCode ||
							job.id}{" "}
						&bull;{" "}
						{
							job.experience
						}
					</span>
				</div>
			</TableCell>

			<TableCell className="min-w-[180px] w-48 py-3 align-middle">
				<div className="space-y-0.5">
					<span className="text-sm font-medium text-slate-800 block">
						{job.type}
					</span>
					<span className="text-xs text-slate-500 font-normal">
						{formatWorkplace(job.workplace)}
					</span>
				</div>
			</TableCell>

			<TableCell className="min-w-[160px] w-48 text-sm text-slate-600 py-3 align-middle">
				{
					job.location
				}
			</TableCell>

			<TableCell className="text-sm text-slate-600 py-3 whitespace-nowrap align-middle text-center tabular-nums">
				{formatDeadlineDate(job.deadline)}
			</TableCell>

			<TableCell className="py-3 text-center whitespace-nowrap align-middle">
				{(() => {
					const count = Number(job.applicantCount) || 0;
					if (count === 0) {
						return (
							<span className="text-sm font-normal text-slate-600">
								Belum ada
							</span>
						);
					}
					return (
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() =>
								onOpenApplicants(
									job,
								)
							}
							className="h-7 px-2 rounded-md text-xs font-medium flex items-center gap-1.5 mx-auto cursor-pointer transition-colors text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
						>
							<Users className="w-3 h-3 text-primary" />
							<span className="tabular-nums">
								{count}{" "}
								Berkas
							</span>
						</Button>
					);
				})()}
			</TableCell>

			<TableCell className="py-3 text-center whitespace-nowrap align-middle">
				<button
					type="button"
					onClick={() =>
						onToggleStatus(
							job.id,
							job.isActive,
						)
					} aria-label="Ubah status aktif lowongan"
					className="cursor-pointer"
				>
					<StatusBadge
						status={
							job.isActive
								? "ACTIVE"
								: "CLOSED"
						}
						label={
							job.isActive
								? "Buka (Aktif)"
								: "Ditutup"
						}
					/>
				</button>
			</TableCell>

			<TableCell className="text-right py-3 whitespace-nowrap align-middle pr-4">
				<TableRowActions
					onEdit={() =>
						onEdit(
							job,
						)
					}
					onDelete={() =>
						onDelete(
							job.id,
							job.title,
						)
					}
					disabled={
						isDeleting
					}
					editTooltip="Edit lowongan"
					deleteTooltip="Hapus lowongan"
				/>
			</TableCell>
		</TableRow>
	);
}
