"use client";

import Link from "next/link";
import { ArrowRightUpIcon } from "@solar-icons/react/linear/arrow-right-up";
import { ZAKAT_TYPES } from "@/constants/zakatTypes";
import { cn } from "@/lib/utils";

/**
 * Organism sub-widget: Pemilih jenis kewajiban zakat (Penghasilan, Maal, Emas, dll)
 * @param {object} props
 * @param {string} props.selectedTypeId - ID zakat yang aktif
 * @param {Function} props.onSelectType - Callback saat jenis zakat dipilih
 * @param {string} [props.className]
 */
export function ZakatTypeSelector({
  selectedTypeId,
  onSelectType,
  className,
}) {
  return (
    <div
      className={cn(
        "bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-2 border-b border-slate-200">
        <div>
          <h3 className="text-base font-semibold text-slate-900">
            Pilih jenis zakat
          </h3>
          <p className="text-sm font-normal text-slate-600">
            Sesuaikan akad dengan kewajiban zakat yang ingin Anda tunaikan.
          </p>
        </div>
        <Link
          href="/kalkulator-zakat"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-medium text-primary hover:underline self-start sm:self-auto shrink-0"
        >
          <span>Hitung di kalkulator</span>
          <ArrowRightUpIcon className="w-4 h-4 shrink-0" />
        </Link>
      </div>

      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3"
        role="radiogroup"
        aria-label="Pilihan Jenis Zakat"
      >
        {ZAKAT_TYPES.map((type) => {
          const isSelected = selectedTypeId === type.id;
          return (
            <button
              key={type.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectType(type.id)}
              className={cn(
                "p-3.5 sm:p-4 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[96px]",
                isSelected
                  ? "border-primary bg-primary/5 text-slate-900 ring-1 ring-primary shadow-xs"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80"
              )}
            >
              <div className="flex items-start justify-between gap-2 w-full">
                <span className="text-sm font-semibold text-slate-900 leading-snug">
                  {type.label}
                </span>
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-slate-300 bg-white"
                  )}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                  )}
                </span>
              </div>
              <p className="text-sm font-normal text-slate-600 leading-relaxed mt-1.5">
                {type.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
