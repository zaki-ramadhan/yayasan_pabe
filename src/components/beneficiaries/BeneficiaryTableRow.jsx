import { TableRow, TableCell } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { BENEFICIARY_CATEGORIES } from "@/data/beneficiaries";

export function BeneficiaryTableRow({ item, index }) {
  const isYatim = item.category === BENEFICIARY_CATEGORIES.YATIM;

  return (
    <TableRow className="hover:bg-slate-50/70 transition-colors">
      {/* Kolom Nomor Urut */}
      <TableCell className="w-16 py-3.5 align-middle text-sm text-slate-500 font-normal">
        {index}
      </TableCell>

      {/* Kolom Nama Penerima (Teks murni tanpa avatar) */}
      <TableCell className="py-3.5 align-middle text-sm font-medium text-slate-900">
        {item.name}
      </TableCell>

      {/* Kolom Kategori (Badge) */}
      <TableCell className="w-40 py-3.5 align-middle whitespace-nowrap">
        <Badge variant={isYatim ? "success" : "info"} className="text-xs font-medium">
          {item.categoryLabel}
        </Badge>
      </TableCell>

      {/* Kolom Jenis Kelamin */}
      <TableCell className="w-36 py-3.5 align-middle whitespace-nowrap text-sm text-slate-700 font-normal">
        {item.gender === "L" ? "Laki-laki" : "Perempuan"}
      </TableCell>
    </TableRow>
  );
}
