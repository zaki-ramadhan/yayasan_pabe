"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { NominalGridPicker } from "@/components/donation/NominalGridPicker";
import { DONATION_LIMITS } from "@/lib/security";
import { getStoredUser } from "@/services/authService";

const PRESET_AMOUNTS = [25000, 50000, 100000];

export function QuickDonateFolder({ defaultCampaignSlug = "beasiswa-santri-penghafal-quran" }) {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState("");
  const router = useRouter();

  const handlePresetSelect = (amt) => {
    setIsCustomMode(false);
    setSelectedAmount(amt);
    setCustomAmount("");
  };

  const handleCustomModeClick = () => {
    setIsCustomMode(true);
    const num = Number(customAmount);
    setSelectedAmount(num || 0);
  };

  const handleCustomChange = (clamped, raw) => {
    setCustomAmount(raw);
    setSelectedAmount(clamped);
  };

  const handleCustomBlur = () => {
    const num = Number(customAmount);
    if (customAmount !== "" && num < 10000) {
      setCustomAmount("10000");
      setSelectedAmount(10000);
    }
  };

  const finalAmount = isCustomMode ? (customAmount ? Number(customAmount) : 0) : selectedAmount;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (finalAmount < 10000 || finalAmount > 100000000) return;

    const user = getStoredUser();
    const targetUrl = `/campaign/${defaultCampaignSlug}/donate?amount=${finalAmount}`;

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(targetUrl)}&reason=donation_requires_login`
      );
      return;
    }

    router.push(targetUrl);
  };

  return (
    <div className="relative w-full aspect-[592/458] min-h-[380px] sm:min-h-[390px]">
      {/* Folder Parent Frame dari public/img/folder hero.svg */}
      <img
        src="/img/folder%20hero.svg"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none drop-shadow-lg"
      />

      {/* Konten Formulir Donasi di Dalam Folder (Align Bawah dengan Jarak Nyaman) */}
      <form
        onSubmit={handleSubmit}
        className="relative z-10 h-full flex flex-col justify-end pt-12 pb-9 sm:pb-11 px-6 sm:px-7 space-y-3 sm:space-y-3.5"
      >
        {/* Header Form */}
        <div className="space-y-0.5 min-w-0">
          <h2 className="text-base font-semibold text-slate-950">
            Formulir Donasi Cepat
          </h2>
          <p className="text-sm text-slate-700">Pilih atau tentukan nominal sedekah</p>
        </div>

        {/* Amount Presets Grid */}
        <div className="space-y-2">
          <NominalGridPicker
            presets={PRESET_AMOUNTS}
            selectedAmount={selectedAmount}
            isCustomMode={isCustomMode}
            onSelectPreset={handlePresetSelect}
            onSelectCustom={handleCustomModeClick}
            columns="2"
            buttonHeight="lg"
          />
        </div>

        {/* Custom Nominal Input */}
        {isCustomMode && (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-150">
            <label className="text-sm font-semibold text-slate-800 block">
              Nominal Lainnya (Min. Rp 10.000)
            </label>
            <CurrencyInput
              autoFocus
              min={DONATION_LIMITS.MIN_AMOUNT}
              max={DONATION_LIMITS.MAX_AMOUNT}
              placeholder="10.000"
              value={customAmount}
              onChange={handleCustomChange}
              onBlur={handleCustomBlur}
            />
          </div>
        )}

        {/* CTA Button */}
        <div className="pt-1">
          <Button
            type="submit"
            disabled={finalAmount < 10000}
            variant="primary3d"
            className="w-full h-12 rounded-lg text-base font-medium"
          >
            Donasi Sekarang
          </Button>
        </div>
      </form>
    </div>
  );
}
