"use client";

import { CheckIcon as Check } from "@solar-icons/react/linear/check";
import { CloseIcon as Close } from "@solar-icons/react/linear/close";
import { cn } from "@/lib/utils";
import { CAREER_STEPS, getStepStatus, getActiveStepIndex, getStepTitle } from "@/lib/careerStepperConfig";

export { getStepStatus, getActiveStepIndex, getStepTitle, CAREER_STEPS };

/**
 * Stepper horizontal menyamping dengan garis konektor antar-node.
 * Fokus jelas: tahapan aktif 100% opasitas, tahapan lain beropasitas redup (45%).
 * Hanya menggunakan ceklis & hijau emerald (tanpa biru & tanpa ikon jam).
 * @param {object} props
 * @param {string} props.status - Status lamaran DB
 * @param {"sm" | "md"} [props.size] - Ukuran stepper (sm untuk card list, md untuk card portal)
 * @param {string} [props.className]
 */
export function DonorCareerTimeline({
  status = "PENDING",
  size = "md",
  className = "",
}) {
  const isSm = size === "sm";
  const activeFocusIndex = getActiveStepIndex(status);

  const step0 = getStepStatus(0, status);
  const step1 = getStepStatus(1, status);
  const step2 = getStepStatus(2, status);

  // Status warna garis konektor horizontal 1 (antara node 0 & 1)
  const isLine1Green =
    step0 === "completed" && (step1 === "completed" || step1 === "active");

  // Status warna garis konektor horizontal 2 (antara node 1 & 2)
  const isLine2Green = step1 === "completed" && step2 === "completed";
  const isLine2Rejected = step1 === "completed" && step2 === "rejected";

  return (
    <div className={cn("w-full select-none", isSm ? "pt-2 pb-1" : "pt-3 pb-2", className)}>
      <div className="relative">
        {/* Garis Konektor 1 (Node 1 ke Node 2) */}
        <div
          className={cn(
            "absolute left-[16.67%] w-[33.33%] h-0.5 -translate-y-1/2 transition-all duration-300",
            isSm ? "top-3.5" : "top-4",
            isLine1Green ? "bg-emerald-600" : "bg-slate-200 opacity-40"
          )}
        />

        {/* Garis Konektor 2 (Node 2 ke Node 3) */}
        <div
          className={cn(
            "absolute left-[50%] w-[33.33%] h-0.5 -translate-y-1/2 transition-all duration-300",
            isSm ? "top-3.5" : "top-4",
            isLine2Green
              ? "bg-emerald-600"
              : isLine2Rejected
              ? "bg-rose-600"
              : "bg-slate-200 opacity-40"
          )}
        />

        {/* Node & Teks 3 Tahap */}
        <div className="relative z-10 grid grid-cols-3 gap-1.5 sm:gap-2">
          {CAREER_STEPS.map((step, idx) => {
            const stepState = getStepStatus(idx, status);
            const isChecked = stepState === "completed" || stepState === "active" || stepState === "rejected";
            const stepTitle = getStepTitle(idx, status);

            return (
              <div
                key={step.id}
                className={cn(
                  "flex flex-col items-center text-center transition-opacity duration-200",
                  isChecked ? "opacity-100" : "opacity-45"
                )}
              >
                {/* Status indicator node */}
                <div
                  className={cn(
                    "rounded-full flex items-center justify-center shrink-0 transition-all",
                    isSm ? "w-7 h-7" : "w-8 h-8",
                    (stepState === "completed" || stepState === "active") && "bg-emerald-600 text-white",
                    stepState === "rejected" && "bg-rose-600 text-white",
                    stepState === "upcoming" && "bg-white border-2 border-slate-300 text-slate-400"
                  )}
                >
                  {stepState === "completed" || stepState === "active" ? (
                    <Check strokeWidth={3} className={isSm ? "w-3.5 h-3.5" : "w-4 h-4"} />
                  ) : stepState === "rejected" ? (
                    <Close strokeWidth={3} className={isSm ? "w-3.5 h-3.5" : "w-4 h-4"} />
                  ) : (
                    <span className={cn(isSm ? "text-[11px]" : "text-xs", "font-normal")}>
                      {idx + 1}
                    </span>
                  )}
                </div>

                <h4
                  className={cn(
                    "text-sm mt-2 leading-snug font-normal",
                    isChecked ? "text-slate-900" : "text-slate-500"
                  )}
                >
                  {stepTitle}
                </h4>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
