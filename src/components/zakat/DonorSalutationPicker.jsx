import { DONOR_SALUTATIONS } from "@/constants/zakatProgram";
import { cn } from "@/lib/utils";

export function DonorSalutationPicker({ selectedSalutation, onSelect }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700 block">
        Sapaan
      </label>
      <div className="flex flex-wrap gap-2">
        {DONOR_SALUTATIONS.map((salutation) => {
          const isSelected = selectedSalutation === salutation.id;
          return (
            <button
              key={salutation.id}
              type="button"
              onClick={() => onSelect(isSelected ? "" : salutation.id)}
              className={cn(
                "px-3.5 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150 cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                isSelected
                  ? "bg-primary text-white border-primary shadow-xs"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              )}
              aria-pressed={isSelected}
            >
              {salutation.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

