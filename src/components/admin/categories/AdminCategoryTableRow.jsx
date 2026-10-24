import { FolderCheck } from "lucide-react";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/table";

export function AdminCategoryTableRow({ item, onEdit, onDelete }) {
	return (
		<TableRow className="hover:bg-slate-50/70 transition-colors">
			<TableCell className="py-3.5 align-middle font-medium text-sm text-slate-900">
				<div className="flex items-center gap-2">
					<FolderCheck className="w-4 h-4 text-primary shrink-0" />
					<span>
						{
							item.name
						}
					</span>
				</div>
			</TableCell>
			<TableCell className="py-3.5 align-middle text-sm font-mono text-slate-500 font-normal">
				{
					item.slug
				}
			</TableCell>
			<TableCell className="text-center py-3.5 align-middle">
				<span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
					{
						item.campaignCount
					}{" "}
					program
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
					editTooltip="Edit kategori"
					deleteTooltip="Hapus kategori"
				/>
			</TableCell>
		</TableRow>
	);
}
