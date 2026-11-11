"use client";

import { ZAKAT_TYPES } from "@/constants/zakatTypes";
import { cn } from "@/lib/utils";

export function ZakatTypeSelector({ selectedTypeId, onSelectType }) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-base font-semibold text-slate-900 block">
          Pilih jenis zakat
        </label>
        <p className="text-sm font-normal text-slate-600">
          Tentukan kategori zakat yang hendak Anda tunaikan sesuai ketentuan syariat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {ZAKAT_TYPES.map((type) => {
          const isSelected = selectedTypeId === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelectType(type.id)}
              className={cn(
                "p-3.5 text-left rounded-xl border transition-all duration-150 cursor-pointer space-y-1 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
                isSelected
                  ? "bg-primary/5 border-primary text-slate-900 shadow-2xs"
                  : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 text-slate-700"
              )}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900">
                  {type.label}
                </span>
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
              </div>
              <p className="text-sm font-normal text-slate-500 line-clamp-2">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

