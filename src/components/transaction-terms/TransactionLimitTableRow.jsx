import { formatRupiah } from "@/lib/formatters";
import { TableRow, TableCell } from "@/components/ui/Table";

/**
 * Single row for the transaction limits table.
 *
 * Adheres strictly to:
 * - Minimum font size: text-sm (no text-xs)
 * - Maximum font weight in data cells: font-medium
 *
 * @param {object} props
 * @param {object} props.item - Transaction limit channel record
 */
export function TransactionLimitTableRow({ item }) {
  return (
    <TableRow>
      {/* Saluran Pembayaran (Logo + Nama & Platform) */}
      <TableCell className="align-middle">
        <div className="flex items-center gap-3">
          {item.logo && (
            <div className="w-14 sm:w-16 h-8 sm:h-9 flex items-center justify-center shrink-0">
              <img
                src={item.logo}
                alt={item.name}
                loading="lazy"
                decoding="async"
                className="max-h-6 w-auto max-w-full object-contain select-none pointer-events-none"
              />
            </div>
          )}
          <span className="text-sm font-medium text-slate-900 truncate">
            {item.name}
          </span>
        </div>
      </TableCell>

      {/* Batas Minimum */}
      <TableCell className="align-middle">
        <span className="text-sm font-normal text-slate-700 block">
          {formatRupiah(item.minAmount)}
        </span>
      </TableCell>

      {/* Batas Maksimum */}
      <TableCell className="align-middle">
        <span className="text-sm font-medium text-slate-900 block">
          {formatRupiah(item.maxAmount)}
        </span>
      </TableCell>
    </TableRow>
  );
}
