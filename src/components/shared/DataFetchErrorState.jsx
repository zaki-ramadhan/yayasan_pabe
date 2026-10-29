import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Reusable inline error fallback when client-side data fetching fails.
 * Prevents silent failures that mislead users into thinking data is empty.
 *
 * @param {object} props
 * @param {string} [props.title="Gagal Memuat Data"]
 * @param {string} [props.description="Terjadi kendala koneksi saat mengambil data terbaru."]
 * @param {Function} [props.onRetry]
 * @param {string} [props.className]
 * @param {boolean} [props.compact=false]
 */
export function DataFetchErrorState({
  title = "Gagal Memuat Data",
  description = "Terjadi kendala koneksi saat mengambil data terbaru.",
  onRetry,
  className,
  compact = false,
}) {
  if (compact) {
    return (
      <div
        role="alert"
        className={cn(
          "flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-lg border border-rose-200 bg-rose-50/60 text-slate-800 text-sm",
          className
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <WifiOff className="w-4 h-4 text-rose-500 shrink-0" aria-hidden="true" />
          <span className="font-medium text-slate-900">{description}</span>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="shrink-0 h-8 text-xs font-medium border-rose-300 hover:bg-rose-100/70 text-rose-700 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Coba Lagi</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      role="alert"
      className={cn(
        "py-10 px-4 rounded-xl border border-dashed border-rose-200 bg-rose-50/30 text-center space-y-3",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
        <WifiOff className="w-5 h-5" aria-hidden="true" />
      </div>

      <div className="space-y-1 max-w-sm mx-auto">
        <h3 className="text-base font-semibold text-slate-950">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
      </div>

      {onRetry && (
        <div className="pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="h-9 px-4 text-xs sm:text-sm font-medium border-slate-300 hover:bg-white text-slate-800 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            <span>Muat Ulang Data</span>
          </Button>
        </div>
      )}
    </div>
  );
}
