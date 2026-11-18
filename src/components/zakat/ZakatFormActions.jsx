import { Button } from "@/components/ui/Button";

/**
 * Reusable zakat form action buttons.
 */
export function ZakatFormActions({
  onReset,
  submitLabel = "Hitung zakat",
  resetLabel = "Atur ulang",
  className = "",
}) {
  return (
    <div className={`flex items-center gap-3 pt-2 ${className}`}>
      <Button
        type="submit"
        variant="default"
        className="rounded-md px-5 h-10 text-sm font-medium cursor-pointer"
      >
        {submitLabel}
      </Button>
      <Button
        type="button"
        variant="outline"
        onClick={onReset}
        className="rounded-md px-4 h-10 text-sm font-medium text-slate-700 hover:text-slate-900 border-slate-300 cursor-pointer"
      >
        {resetLabel}
      </Button>
    </div>
  );
}
