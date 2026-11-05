import { formatRupiah } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Universal preset donation amount grid buttons with 'Lainnya' option.
 *
 * @param {object} props
 * @param {number[]} props.presets - Array of numeric preset amounts
 * @param {number} props.selectedAmount - Currently selected amount
 * @param {boolean} props.isCustomMode - Whether custom nominal mode is active
 * @param {Function} props.onSelectPreset - (amt: number) => void
 * @param {Function} props.onSelectCustom - () => void
 * @param {"2" | "3" | "2-to-3"} [props.columns] - Grid columns layout
 * @param {"default" | "lg" | "sm"} [props.buttonHeight] - Button height sizing
 * @param {string} [props.customLabel] - Label for custom button ("Lainnya" by default)
 * @param {string} [props.className] - Extra grid container classes
 */
export function NominalGridPicker({
  presets = [],
  selectedAmount,
  isCustomMode = false,
  onSelectPreset,
  onSelectCustom,
  columns = "2-to-3",
  buttonHeight = "default",
  customLabel = "Lainnya",
  className = "",
}) {
  const columnClasses = {
    "2": "grid-cols-2",
    "3": "grid-cols-3",
    "2-to-3": "grid-cols-2 sm:grid-cols-3",
  }[columns] || "grid-cols-2 sm:grid-cols-3";

  const heightClasses = {
    default: "min-h-[46px] py-3 px-3.5 text-sm sm:text-base",
    lg: "min-h-[56px] py-2.5 px-3 text-sm",
    sm: "min-h-[38px] sm:min-h-[40px] py-2 px-2 sm:px-2.5 text-sm font-medium",
  }[buttonHeight] || "min-h-[46px] py-3 px-3.5 text-sm sm:text-base";

  return (
    <div className={cn("grid gap-2.5", columnClasses, className)}>
      {presets.map((amt) => {
        const isSelected = !isCustomMode && selectedAmount === amt;
        return (
          <button
            key={amt}
            type="button"
            onClick={() => onSelectPreset(amt)}
            className={cn(
              "rounded-lg border transition-all text-center cursor-pointer flex items-center justify-center font-medium",
              heightClasses,
              isSelected
                ? "bg-blue-50 text-blue-950 border-blue-600 ring-1 ring-blue-600 font-semibold shadow-2xs"
                : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
            )}
          >
            {formatRupiah(amt)}
          </button>
        );
      })}

      <button
        type="button"
        onClick={onSelectCustom}
        className={cn(
          "rounded-lg border transition-all text-center cursor-pointer flex items-center justify-center font-medium",
          buttonHeight === "lg" ? "min-h-[42px] py-2.5 px-3 text-sm" : heightClasses,
          isCustomMode
            ? "bg-blue-50 text-blue-950 border-blue-600 ring-1 ring-blue-600 font-semibold shadow-2xs"
            : "bg-white border-slate-300 text-slate-800 hover:bg-slate-50"
        )}
      >
        {customLabel}
      </button>
    </div>
  );
}
