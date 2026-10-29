"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { StatusBadge } from "@/components/ui/Badge";

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

			<TableCell className="min-w-[200px] w-52 py-3 align-middle">
				<div className="space-y-0.5">
					<span
						className="text-sm font-medium text-slate-900 block leading-snug line-clamp-2"
					>
						{job.title}
					</span>
					<span className="text-sm text-slate-500">
						{job.jobCode ||
							job.id}{" "}
						&bull;{" "}
						{
							job.experience
						}
					</span>
				</div>
			</TableCell>

			<TableCell className="py-3 align-middle">
				<div className="space-y-0.5">
					<span className="text-sm font-medium text-slate-800 block">
						{
							job.department
						}
					</span>
					<span className="text-sm text-slate-500">
						{
							job.type
						}{" "}
						(
						{
							job.workplace
						}
						)
					</span>
				</div>
			</TableCell>

			<TableCell className="text-sm text-slate-600 py-3 align-middle">
				{
					job.location
				}
			</TableCell>

			<TableCell className="text-sm text-slate-600 py-3 whitespace-nowrap align-middle">
				{
					job.deadline
				}
			</TableCell>

			<TableCell className="py-3 text-center whitespace-nowrap align-middle">
				{(() => {
					const count = Number(job.applicantCount) || 0;
					const hasApplicants = count > 0;
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
							className={`h-7 px-2 rounded-md text-xs font-medium flex items-center gap-1.5 mx-auto cursor-pointer transition-colors ${
								hasApplicants
									? "text-primary border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50"
									: "text-slate-400 border-slate-200 bg-transparent hover:bg-slate-50 hover:text-slate-600"
							}`}
						>
							<Users className={`w-3 h-3 ${hasApplicants ? "text-primary" : "text-slate-400"}`} />
							<span>
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
