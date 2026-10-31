/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/services/authService";
import { DEFAULT_GOLD_PRICE_PER_GRAM } from "@/lib/zakat/constants";
import {
  calculateZakatPenghasilan,
  calculateZakatMaal,
  calculateZakatPerusahaan,
  calculateZakatPerdagangan,
  calculateZakatEmas,
} from "@/lib/zakat/calculations";
import { ZakatModeSelector } from "@/components/zakat/ZakatModeSelector";
import { ZakatResultPanel } from "@/components/zakat/ZakatResultPanel";
import { ZakatPenghasilanForm } from "@/components/zakat/forms/ZakatPenghasilanForm";
import { ZakatMaalForm } from "@/components/zakat/forms/ZakatMaalForm";
import { ZakatPerusahaanForm } from "@/components/zakat/forms/ZakatPerusahaanForm";
import { ZakatPerdaganganForm } from "@/components/zakat/forms/ZakatPerdaganganForm";
import { ZakatEmasForm } from "@/components/zakat/forms/ZakatEmasForm";

const INITIAL_PENGHASILAN = { gaji: 0, penghasilanLain: 0 };
const INITIAL_MAAL = {
  uangTunaiTabungan: 0,
  deposito: 0,
  investasi: 0,
  piutang: 0,
  hartaLain: 0,
  utangJatuhTempo: 0,
  isHaulMet: true,
};
const INITIAL_PERUSAHAAN = {
  submode: "jasa",
  pendapatanSebelumPajak: 0,
  aktivaLancar: 0,
  pasivaLancar: 0,
  labaUsaha: 0,
};
const INITIAL_PERDAGANGAN = {
  asetLancar: 0,
  laba: 0,
  isHaulMet: true,
};
const INITIAL_EMAS = {
  jumlahGram: 0,
  hargaPerGram: DEFAULT_GOLD_PRICE_PER_GRAM,
  isHaulMet: true,
};

export function ZakatCalculator({ targetCampaignSlug = "zakat-penghasilan-pemberdayaan-mustahik" }) {
  const router = useRouter();

  // State mode aktif
  const [activeMode, setActiveMode] = useState("penghasilan");

  // State form tiap mode
  const [penghasilan, setPenghasilan] = useState(INITIAL_PENGHASILAN);
  const [maal, setMaal] = useState(INITIAL_MAAL);
  const [perusahaan, setPerusahaan] = useState(INITIAL_PERUSAHAAN);
  const [perdagangan, setPerdagangan] = useState(INITIAL_PERDAGANGAN);
  const [emas, setEmas] = useState(INITIAL_EMAS);

  // Status perhitungan tiap mode
  const [calculatedState, setCalculatedState] = useState({
    penghasilan: false,
    maal: false,
    perusahaan: false,
    perdagangan: false,
    emas: false,
  });

  // Hidrasi sesi dari sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("zakat_calculator_state");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeMode) setActiveMode(parsed.activeMode);
        if (parsed.penghasilan) setPenghasilan(parsed.penghasilan);
        if (parsed.maal) setMaal(parsed.maal);
        if (parsed.perusahaan) setPerusahaan(parsed.perusahaan);
        if (parsed.perdagangan) setPerdagangan(parsed.perdagangan);
        if (parsed.emas) setEmas(parsed.emas);
        if (parsed.calculatedState) setCalculatedState(parsed.calculatedState);
      }
    } catch {
      // Abaikan jika parsing gagal
    }
  }, []);

  // Simpan sinkronisasi sesi ke sessionStorage
  useEffect(() => {
    try {
      const dataToSave = {
        activeMode,
        penghasilan,
        maal,
        perusahaan,
        perdagangan,
        emas,
        calculatedState,
      };
      sessionStorage.setItem("zakat_calculator_state", JSON.stringify(dataToSave));
    } catch {
      // Abaikan jika kuota penuh
    }
  }, [activeMode, penghasilan, maal, perusahaan, perdagangan, emas, calculatedState]);

  const updateField = (setter) => (field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = (mode) => {
    setCalculatedState((prev) => ({ ...prev, [mode]: true }));
  };

  const handleReset = (mode) => {
    setCalculatedState((prev) => ({ ...prev, [mode]: false }));
    switch (mode) {
      case "penghasilan":
        setPenghasilan(INITIAL_PENGHASILAN);
        break;
      case "maal":
        setMaal(INITIAL_MAAL);
        break;
      case "perusahaan":
        setPerusahaan(INITIAL_PERUSAHAAN);
        break;
      case "perdagangan":
        setPerdagangan(INITIAL_PERDAGANGAN);
        break;
      case "emas":
        setEmas(INITIAL_EMAS);
        break;
      default:
        break;
    }
  };

  const currentResult = useMemo(() => {
    switch (activeMode) {
      case "penghasilan":
        return calculateZakatPenghasilan(penghasilan);
      case "maal":
        return calculateZakatMaal(maal);
      case "perusahaan":
        return calculateZakatPerusahaan(perusahaan);
      case "perdagangan":
        return calculateZakatPerdagangan(perdagangan);
      case "emas":
        return calculateZakatEmas(emas);
      default:
        return null;
    }
  }, [activeMode, penghasilan, maal, perusahaan, perdagangan, emas]);

  const handlePay = () => {
    if (!currentResult || currentResult.zakatAmount <= 0) return;
    const slug = targetCampaignSlug || "zakat-penghasilan-pemberdayaan-mustahik";
    const targetUrl = `/campaign/${slug}/donate?amount=${currentResult.zakatAmount}&type=${currentResult.categoryKey}`;
    const user = getStoredUser();

    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(targetUrl)}&reason=donation_requires_login`
      );
      return;
    }

    router.push(targetUrl);
  };

  return (
    <div className="space-y-4">
      {/* 1. Kategori Tab Navigasi (5 Mode) */}
      <div className="flex justify-center">
        <ZakatModeSelector
          activeMode={activeMode}
          onSelectMode={setActiveMode}
        />
      </div>

      {/* 2. Grid Finansial 2 Kolom ala Earnest */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Kolom Kiri: Form Input Aktif */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-lg border border-slate-200 shadow-xs">
          {activeMode === "penghasilan" && (
            <ZakatPenghasilanForm
              values={penghasilan}
              onChange={updateField(setPenghasilan)}
              onSubmit={() => handleCalculate("penghasilan")}
              onReset={() => handleReset("penghasilan")}
            />
          )}

          {activeMode === "maal" && (
            <ZakatMaalForm
              values={maal}
              onChange={updateField(setMaal)}
              onSubmit={() => handleCalculate("maal")}
              onReset={() => handleReset("maal")}
            />
          )}

          {activeMode === "perusahaan" && (
            <ZakatPerusahaanForm
              values={perusahaan}
              onChange={updateField(setPerusahaan)}
              onSubmit={() => handleCalculate("perusahaan")}
              onReset={() => handleReset("perusahaan")}
            />
          )}

          {activeMode === "perdagangan" && (
            <ZakatPerdaganganForm
              values={perdagangan}
              onChange={updateField(setPerdagangan)}
              onSubmit={() => handleCalculate("perdagangan")}
              onReset={() => handleReset("perdagangan")}
            />
          )}

          {activeMode === "emas" && (
            <ZakatEmasForm
              values={emas}
              onChange={updateField(setEmas)}
              onSubmit={() => handleCalculate("emas")}
              onReset={() => handleReset("emas")}
            />
          )}
        </div>

        {/* Kolom Kanan: Panel Metrik & Ledger Hasil ala Earnest */}
        <div className="lg:col-span-5 sticky top-24">
          <ZakatResultPanel
            result={currentResult}
            hasCalculated={calculatedState[activeMode]}
            onPay={handlePay}
          />
        </div>
      </div>
    </div>
  );
}
