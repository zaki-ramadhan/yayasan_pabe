import { FolderCheck } from "lucide-react";
import { TableRow, TableCell, TableRowActions } from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";

export function AdminCategoryTableRow({
  item,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
}) {
  return (
    <TableRow
      className={`hover:bg-slate-50/70 transition-colors ${
        isSelected ? "bg-primary/5 hover:bg-primary/10" : ""
      }`}
    >
      {/* 0. Selection Checkbox */}
      <TableCell className="w-12 text-center py-3.5 px-3 align-middle" onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect?.(item.id)}
          aria-label={`Pilih kategori: ${item.name}`}
        />
      </TableCell>

      <TableCell className="py-3.5 align-middle font-medium text-sm text-slate-900 max-w-xs">
				<div className="flex items-center gap-2 min-w-0">
					<FolderCheck className="w-4 h-4 text-primary shrink-0" />
					<span className="truncate">
						{item.name}
					</span>
				</div>
			</TableCell>
			<TableCell className="py-3.5 align-middle text-sm font-mono text-slate-500 font-normal max-w-[200px]">
				<span className="block truncate">
					{item.slug}
				</span>
			</TableCell>
			<TableCell className="text-center py-3.5 align-middle">
				<span
					title={`${item.campaignCount} program`}
					className="inline-flex items-center px-2 py-0.5 rounded-md text-sm font-normal bg-slate-100 text-slate-700 max-w-[140px] truncate whitespace-nowrap"
				>
					{item.campaignCount} program
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
