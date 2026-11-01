/**
 * A single label-value row for payment summary breakdowns.
 *
 * @param {object} props
 * @param {string} props.label
 * @param {React.ReactNode} props.value
 * @param {string} [props.labelClass]
 * @param {string} [props.valueClass]
 */
export function SummaryRow({ label, value, labelClass = "", valueClass = "" }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span className={labelClass}>{label}</span>
      <span className={`font-normal text-slate-800 ${valueClass}`}>{value}</span>
    </div>
  );
}
