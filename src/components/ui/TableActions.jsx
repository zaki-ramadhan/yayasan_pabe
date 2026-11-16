"use client";

import * as React from "react";
import { EyeIcon } from "@solar-icons/react/line-duotone/eye";
import { Pen2Icon } from "@solar-icons/react/line-duotone/pen-2";
import { TrashBinTrashIcon } from "@solar-icons/react/line-duotone/trash-bin-trash";
import { LoaderIcon } from "@solar-icons/react/linear/loader";
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
	isDeleting = false,
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
					aria-label={
						viewTooltip
					}
					className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
				>
					<EyeIcon className="w-4 h-4" />
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
					aria-label={
						editTooltip
					}
					className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
				>
					<Pen2Icon className="w-4 h-4" />
				</button>
			)}

			{onDelete && (
				<button
					type="button"
					onClick={
						onDelete
					}
					disabled={
						disabled || isDeleting
					}
					aria-label={
						deleteTooltip
					}
					className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
				>
					{isDeleting ? (
						<LoaderIcon className="w-4 h-4 animate-spin text-rose-600" />
					) : (
						<TrashBinTrashIcon className="w-4 h-4" />
					)}
				</button>
			)}
		</div>
	);
}
