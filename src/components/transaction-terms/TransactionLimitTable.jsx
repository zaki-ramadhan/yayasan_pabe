import { TransactionLimitTableRow } from "./TransactionLimitTableRow";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmptyRow,
} from "@/components/ui/Table";

/**
 * Reusable table component for displaying transaction limits.
 *
 * Adheres strictly to:
 * - Minimum font size: text-sm (no text-xs anywhere)
 * - Maximum font weight: font-medium in tbody
 * - Responsive table container with horizontal scroll (overflow-x-auto)
 *
 * @param {object} props
 * @param {string} props.title - Table section title (e.g. Virtual Account (VA))
 * @param {string} [props.description] - Subtitle / explanatory text
 * @param {Array<object>} props.items - Array of channel limit records
 */
export function TransactionLimitTable({ title, description, items = [] }) {
  return (
    <section className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-medium text-slate-900 tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-sm font-normal text-slate-600 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <TableContainer className="bg-white">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2 font-medium text-slate-900">
              Saluran Donasi
            </TableHead>
            <TableHead className="w-1/4 font-medium text-slate-900">
              Batas Min.
            </TableHead>
            <TableHead className="w-1/4 font-medium text-slate-900">
              Batas Maks.
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items && items.length > 0 ? (
            items.map((item) => (
              <TransactionLimitTableRow
                key={item.id}
                item={item}
              />
            ))
          ) : (
            <TableEmptyRow colSpan={3} />
          )}
        </TableBody>
      </Table>
    </TableContainer>
    </section>
  );
}
