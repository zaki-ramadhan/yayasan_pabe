import { cn } from "@/lib/utils";

export function AnonymousCheckbox({
  id = "anonymous-checkbox",
  checked = false,
  onChange,
  variant = "card",
  className,
}) {
  if (variant === "inline") {
    return (
      <label htmlFor={id} className={cn("flex items-center gap-2 cursor-pointer select-none", className)}>
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-3.5 h-3.5 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
        />
        <span className="text-xs sm:text-sm text-slate-700 font-normal">
          Sembunyikan nama saya (tampilkan sebagai Hamba Allah)
        </span>
      </label>
    );
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        "flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-300 cursor-pointer select-none hover:bg-slate-100/70 transition-colors",
        className
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary cursor-pointer"
      />
      <span className="text-sm font-normal text-slate-800">
        Sembunyikan nama saya (tampilkan sebagai Hamba Allah)
      </span>
    </label>
  );
}
