"use client";

import { useState } from "react";
import { Box, CreditCard } from "lucide-react";
import { Volunteer3DLanyardCard } from "./Volunteer3DLanyardCard";
import { VolunteerIdCard } from "./VolunteerIdCard";

export function VolunteerCardSwitcher({
  volunteer,
  defaultMode = "3d",
  className = "",
  cardClassName = "",
  height = 540,
}) {
  const [mode, setMode] = useState(defaultMode); // "3d" | "2d"

  if (!volunteer) return null;

  return (
    <div className={`space-y-4 w-full ${className}`}>
      {/* Switcher Tabs Header */}
      <div className="flex justify-center">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setMode("3d")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === "3d"
                ? "bg-white text-emerald-800 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
            aria-pressed={mode === "3d"}
          >
            <Box className="w-3.5 h-3.5" />
            <span>KTA 3D interaktif</span>
          </button>

          <button
            type="button"
            onClick={() => setMode("2d")}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              mode === "2d"
                ? "bg-white text-emerald-800 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
            aria-pressed={mode === "2d"}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Kartu siap cetak (2D)</span>
          </button>
        </div>
      </div>

      {/* Konten Mode Aktif */}
      <div className="transition-opacity duration-200">
        {mode === "3d" ? (
          <div className="max-w-md mx-auto">
            <Volunteer3DLanyardCard volunteer={volunteer} height={height} className={cardClassName} />
          </div>
        ) : (
          <div className="py-2">
            <VolunteerIdCard volunteer={volunteer} className={cardClassName} />
          </div>
        )}
      </div>
    </div>
  );
}

export default VolunteerCardSwitcher;
