"use client";

import Image from "next/image";
import { Check } from "lucide-react";
import { USER_AVATAR_PRESETS } from "@/lib/assetConstants";

/**
 * Sub-komponen pemilihan 6 avatar karakter default yayasan.
 * Memberikan feedback visual jelas dengan border hijau emerald dan tanda centang pada avatar yang aktif.
 */
export function DonorAvatarPresetPicker({
  presets = USER_AVATAR_PRESETS,
  selectedAvatar = "",
  onSelect,
  disabled = false,
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs font-medium text-slate-700 text-center">Pilih avatar karakter</p>
      <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
        {presets.map((preset, idx) => {
          const isSelected = selectedAvatar === preset;
          return (
            <button
              key={idx}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(preset)}
              className={`relative w-14 h-14 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${
                isSelected
                  ? "border-emerald-600 ring-2 ring-emerald-600/20 scale-105"
                  : "border-slate-200 hover:border-slate-400"
              } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
              aria-label={`Pilih avatar karakter ${idx + 1}`}
            >
              <Image
                src={preset}
                alt={`Pilihan avatar ${idx + 1}`}
                fill
                sizes="56px"
                className="object-cover"
              />
              {isSelected && (
                <span className="absolute inset-0 bg-emerald-950/25 flex items-center justify-center">
                  <Check className="w-5 h-5 text-white drop-shadow" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
