import { cn } from "@/lib/utils";

const MODES = [
  { id: "profesi", label: "Profesi" },
  { id: "emas", label: "Emas" },
  { id: "perak", label: "Perak" },
  { id: "perdagangan", label: "Perdagangan" },
  { id: "perusahaan", label: "Perusahaan" },
  { id: "tabungan", label: "Tabungan" },
  { id: "pertanian", label: "Pertanian" },
];

/**
 * Mode selector for zakat categories.
 */
export function ZakatModeSelector({
  activeMode,
  onSelectMode,
  className,
}) {
  return (
    <div
      className={cn(
        "inline-flex p-1 bg-slate-100 rounded-md border border-slate-200 gap-1 overflow-x-auto max-w-full",
        className
      )}
      role="tablist"
      aria-label="Kategori Zakat"
    >
      {MODES.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelectMode(mode.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer select-none",
              isActive
                ? "bg-primary text-white shadow-xs font-semibold"
                : "text-slate-700 hover:text-slate-950 hover:bg-slate-200/60"
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
