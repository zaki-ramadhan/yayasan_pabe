"use client";

import * as React from "react";
import { Edit3, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Komponen terpusat untuk tombol aksi standar pada setiap baris tabel (View, Edit, Delete)
 */
export function TableRowActions({
	onView,
	onEdit,
	onDelete,
	viewTooltip = "Lihat rincian",
	editTooltip = "Edit",
	deleteTooltip = "Hapus",
	disabled = false,
	className = "",
	children,
}) {
	return (
		<div
			className={cn(
				"inline-flex items-center gap-1 justify-end",
				className,
			)}
		>
			{
				children
			}

			{onView && (
				<button
					type="button"
					onClick={
						onView
					}
					disabled={
						disabled
					}
					title={
						viewTooltip
					}
					aria-label={
						viewTooltip
					}
					className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Eye className="w-4 h-4" />
				</button>
			)}

			{onEdit && (
				<button
					type="button"
					onClick={
						onEdit
					}
					disabled={
						disabled
					}
					title={
						editTooltip
					}
					aria-label={
						editTooltip
					}
					className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Edit3 className="w-4 h-4" />
				</button>
			)}

			{onDelete && (
				<button
					type="button"
					onClick={
						onDelete
					}
					disabled={
						disabled
					}
					title={
						deleteTooltip
					}
					aria-label={
						deleteTooltip
					}
					className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			)}
		</div>
	);
}
