import { formatRupiah, formatDate } from "@/lib/formatters";
import { TableRow, TableCell } from "@/components/ui/table";

/**
 * Single table row for financial transactions.
 * Strictly adheres to font size >= text-sm and font weight <= font-medium.
 *
 * @param {object} props
 * @param {object} props.transaction - Transaction data object
 */
export function FinancialTransactionRow({ transaction }) {
  const isIncome = transaction.type === "INCOME" || transaction.amount > 0;
  const absAmount = Math.abs(transaction.amount);

  return (
    <TableRow>
      {/* Date */}
      <TableCell className="font-medium text-slate-800 whitespace-nowrap align-middle">
        {formatDate(transaction.date, { month: "short" })}
      </TableCell>

      {/* Source */}
      <TableCell className="font-normal text-slate-600 whitespace-nowrap align-middle">
        {transaction.source}
      </TableCell>

      {/* Type */}
      <TableCell className="font-normal text-slate-700 whitespace-nowrap align-middle">
        {transaction.typeLabel || (isIncome ? "Donasi Masuk" : "Penyaluran")}
      </TableCell>

      {/* Description */}
      <TableCell className="font-normal text-slate-800 max-w-xs truncate align-middle" title={transaction.description}>
        {transaction.description}
      </TableCell>

      {/* Category */}
      <TableCell className="font-normal text-slate-600 whitespace-nowrap align-middle">
        {transaction.category}
      </TableCell>

      {/* Amount */}
      <TableCell className="font-medium whitespace-nowrap text-right align-middle">
        <span className={isIncome ? "text-emerald-700" : "text-slate-900"}>
          {isIncome ? `+${formatRupiah(absAmount)}` : `-${formatRupiah(absAmount)}`}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell className="whitespace-nowrap text-center align-middle">
        <span
          className={
            isIncome
              ? "inline-block px-2.5 py-0.5 rounded-md text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200"
              : "inline-block px-2.5 py-0.5 rounded-md text-sm font-medium text-slate-800 bg-slate-100 border border-slate-200"
          }
        >
          {transaction.statusLabel || (isIncome ? "Diterima" : "Tersalurkan")}
        </span>
      </TableCell>
    </TableRow>
  );
}
