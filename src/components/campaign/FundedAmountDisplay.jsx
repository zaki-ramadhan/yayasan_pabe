import { formatRupiah } from "@/lib/formatters";

/**
 * Reusable "Dana Terkumpul" label + amount block.
 * Accepts className overrides so each consumer keeps its original typography.
 */
export function FundedAmountDisplay({
  amount,
  label = "Dana Terkumpul",
  labelClassName = "text-sm text-slate-700 block",
  amountClassName = "text-lg sm:text-xl font-semibold text-primary",
}) {
  return (
    <div>
      <span className={labelClassName}>{label}</span>
      <span className={amountClassName}>{formatRupiah(amount)}</span>
    </div>
  );
}
