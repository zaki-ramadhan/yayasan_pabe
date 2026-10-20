import { formatRupiah } from "@/lib/formatters";

/**
 * Reusable Custom Tooltip Card for Recharts.
 * Adheres strictly to design constraints: text-sm minimum, no bold, clean border/shadow.
 */
export function ChartTooltipCard({ active, payload, label, formatter = formatRupiah }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-md p-3 text-sm space-y-2 min-w-[200px]">
      {label && (
        <div className="font-semibold text-slate-900 border-b border-slate-100 pb-1.5">
          {label}
        </div>
      )}
      <div className="space-y-1.5">
        {payload
          .filter((item) => item && item.value !== undefined && item.value !== null && Number(item.value) > 0)
          .map((item, index) => (
            <div
              key={`tooltip-item-${item.dataKey || item.name}-${index}`}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-xs shrink-0"
                  style={{ backgroundColor: item.color || item.fill }}
                  aria-hidden="true"
                />
                <span className="text-slate-500 font-normal">{item.name}</span>
              </div>
              <span className="font-medium text-slate-900">
                {formatter(Number(item.value))}
              </span>
            </div>
          ))}
      </div>
    </div>
  );
}
