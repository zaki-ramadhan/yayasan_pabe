import { cn } from "@/lib/utils";

/**
 * Komponen Checkbox Hamba Allah (Donasi & Zakat)
 * Seluruh area kartu dibungkus label interaktif sehingga ramah klik di perangkat mobile maupun desktop.
 */
export function AnonymousCheckbox({
  id = "anonymous-checkbox",
  checked = false,
  onChange,
  variant = "card",
  title = "Sembunyikan nama saya (Hamba Allah)",
  description = "Nama disamarkan pada daftar publik.",
  className,
}) {
  if (variant === "inline") {
    return (
      <label
        htmlFor={id}
        className={cn("flex items-center gap-2 cursor-pointer select-none", className)}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-3.5 h-3.5 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
        />
        <span className="text-xs sm:text-sm text-slate-700 font-normal">
          {title}
        </span>
      </label>
    );
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-start gap-3 p-3.5 rounded-lg border transition-all cursor-pointer select-none",
        checked
          ? "border-primary bg-primary/5 text-slate-900 shadow-2xs ring-1 ring-primary/20"
          : "border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100/80 hover:border-slate-400",
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 mt-0.5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer shrink-0"
      />
      <div className="space-y-0.5 min-w-0">
        <span className="text-sm font-medium text-slate-900 block leading-tight">
          {title}
        </span>
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </label>
  );
}
