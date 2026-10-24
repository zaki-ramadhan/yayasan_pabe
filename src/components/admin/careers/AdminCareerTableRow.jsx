"use client";

import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";

export function AdminCareerTableRow({
	job,
	onOpenApplicants,
	onToggleStatus,
	onEdit,
	onDelete,
	isDeleting,
}) {
	return (
		<TableRow key={job.id}>
			<TableCell className="py-3 align-middle">
				<div className="space-y-0.5">
					<span className="text-sm font-medium text-slate-900 block">
						{
							job.title
						}
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
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() =>
						onOpenApplicants(
							job,
						)
					}
					className="h-8 px-2.5 rounded-md text-sm font-medium text-primary border-primary/30 hover:bg-primary/5 flex items-center gap-1.5 mx-auto cursor-pointer"
				>
					<Users className="w-3.5 h-3.5" />
					<span>
						{job.applicantCount ||
							0}{" "}
						Berkas
					</span>
				</Button>
			</TableCell>

			<TableCell className="py-3 text-center whitespace-nowrap align-middle">
				<button
					type="button"
					onClick={() =>
						onToggleStatus(
							job.id,
							job.isActive,
						)
					}
					title="Klik untuk mengubah status aktif lowongan"
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
