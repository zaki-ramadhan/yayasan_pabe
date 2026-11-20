"use client";

import { CheckIcon as Check } from "@solar-icons/react/linear/check";
import { Button } from "@/components/ui/Button";
import { DialogFooter } from "@/components/ui/Dialog";

export function CareerApplySuccessState({ job, onClose }) {
  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-8 sm:px-6 flex flex-col items-center justify-center text-center space-y-4">
        <div className="relative inline-flex items-center justify-center mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-50/80 border border-emerald-100/90 flex items-center justify-center shadow-xs">
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 border-t border-t-emerald-300/80 border-x border-x-emerald-600 border-b-[3px] sm:border-b-4 border-b-emerald-800 text-white flex items-center justify-center shadow-[inset_0_2px_2px_rgba(255,255,255,0.45),0_4px_10px_rgba(5,150,105,0.3)]">
              <Check strokeWidth={3} className="w-5 h-5 sm:w-7 sm:h-7 drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Terima Kasih atas Lamaran Anda
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Lamaran untuk posisi <strong className="font-semibold text-slate-900">{job.title}</strong> telah kami terima dan akan segera ditinjau oleh tim rekrutmen.
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button
          type="button"
          onClick={onClose}
          className="h-9 px-5 text-xs sm:text-sm font-medium rounded-lg cursor-pointer"
        >
          Tutup &amp; Selesai
        </Button>
      </DialogFooter>
    </div>
  );
}
