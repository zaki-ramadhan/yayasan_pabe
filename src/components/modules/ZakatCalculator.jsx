/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStoredUser } from "@/services/authService";
import {
  DEFAULT_GOLD_PRICE_PER_GRAM,
  DEFAULT_SILVER_PRICE_PER_GRAM,
  DEFAULT_BERAS_PRICE_PER_KG,
} from "@/lib/zakat/constants";
import {
  calculateZakatProfesi,
  calculateZakatEmas,
  calculateZakatPerak,
  calculateZakatPerdagangan,
  calculateZakatPerusahaan,
  calculateZakatTabungan,
  calculateZakatPertanian,
} from "@/lib/zakat/calculations";
import { ZakatModeSelector } from "@/components/zakat/ZakatModeSelector";
import { ZakatResultPanel } from "@/components/zakat/ZakatResultPanel";
import { ZakatProfesiForm } from "@/components/zakat/forms/ZakatProfesiForm";
import { ZakatEmasForm } from "@/components/zakat/forms/ZakatEmasForm";
import { ZakatPerakForm } from "@/components/zakat/forms/ZakatPerakForm";
import { ZakatPerdaganganForm } from "@/components/zakat/forms/ZakatPerdaganganForm";
import { ZakatPerusahaanForm } from "@/components/zakat/forms/ZakatPerusahaanForm";
import { ZakatTabunganForm } from "@/components/zakat/forms/ZakatTabunganForm";
import { ZakatPertanianForm } from "@/components/zakat/forms/ZakatPertanianForm";
import { ZakatGuideTable } from "@/components/zakat/ZakatGuideTable";

const INITIAL_PROFESI = { gaji: 0, penghasilanLain: 0 };
const INITIAL_EMAS = {
  jumlahGram: 0,
  hargaPerGram: DEFAULT_GOLD_PRICE_PER_GRAM,
  isHaulMet: true,
};
const INITIAL_PERAK = {
  jumlahGram: 0,
  hargaPerGram: DEFAULT_SILVER_PRICE_PER_GRAM,
  isHaulMet: true,
};
const INITIAL_PERDAGANGAN = {
  asetLancar: 0,
  laba: 0,
  utangJatuhTempo: 0,
  isHaulMet: true,
};
const INITIAL_PERUSAHAAN = {
  aktivaLancar: 0,
  labaUsaha: 0,
  pasivaLancar: 0,
  persenKepemilikan: 100,
};
const INITIAL_TABUNGAN = {
  saldoTabungan: 0,
  bungaBagiHasil: 0,
  utangJatuhTempo: 0,
  isHaulMet: true,
};
const INITIAL_PERTANIAN = {
  beratPanenKg: 0,
  komoditas: "beras",
  jenisPengairan: "tadah_hujan",
  hargaPerKg: DEFAULT_BERAS_PRICE_PER_KG,
};

export function ZakatCalculator({ targetCampaignSlug = "zakat" }) {
  const router = useRouter();

  const [activeMode, setActiveMode] = useState("profesi");

  const [profesi, setProfesi] = useState(INITIAL_PROFESI);
  const [emas, setEmas] = useState(INITIAL_EMAS);
  const [perak, setPerak] = useState(INITIAL_PERAK);
  const [perdagangan, setPerdagangan] = useState(INITIAL_PERDAGANGAN);
  const [perusahaan, setPerusahaan] = useState(INITIAL_PERUSAHAAN);
  const [tabungan, setTabungan] = useState(INITIAL_TABUNGAN);
  const [pertanian, setPertanian] = useState(INITIAL_PERTANIAN);

  const [calculatedState, setCalculatedState] = useState({
    profesi: false,
    emas: false,
    perak: false,
    perdagangan: false,
    perusahaan: false,
    tabungan: false,
    pertanian: false,
  });

  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    try {
      const saved =
        (typeof window !== "undefined" && localStorage.getItem("zakat_calculator_state")) ||
        (typeof window !== "undefined" && sessionStorage.getItem("zakat_calculator_state"));

      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.activeMode) {
          const modeMap = {
            penghasilan: "profesi",
            maal: "tabungan",
          };
          setActiveMode(modeMap[parsed.activeMode] || parsed.activeMode);
        }
        if (parsed.profesi || parsed.penghasilan) {
          setProfesi(parsed.profesi || parsed.penghasilan);
        }
        if (parsed.emas) setEmas(parsed.emas);
        if (parsed.perak) setPerak(parsed.perak);
        if (parsed.perdagangan) setPerdagangan(parsed.perdagangan);
        if (parsed.perusahaan) setPerusahaan(parsed.perusahaan);
        if (parsed.tabungan || parsed.maal) {
          setTabungan(parsed.tabungan || parsed.maal);
        }
        if (parsed.pertanian) setPertanian(parsed.pertanian);
        if (parsed.calculatedState) setCalculatedState(parsed.calculatedState);
      }
    } catch {
    } finally {
      setIsRestored(true);
    }
  }, []);

  useEffect(() => {
    if (!isRestored) return;

    try {
      const dataToSave = {
        activeMode,
        profesi,
        emas,
        perak,
        perdagangan,
        perusahaan,
        tabungan,
        pertanian,
        calculatedState,
      };
      const serialized = JSON.stringify(dataToSave);
      localStorage.setItem("zakat_calculator_state", serialized);
      sessionStorage.setItem("zakat_calculator_state", serialized);
    } catch {
    }
  }, [
    isRestored,
    activeMode,
    profesi,
    emas,
    perak,
    perdagangan,
    perusahaan,
    tabungan,
    pertanian,
    calculatedState,
  ]);

  const updateField = (setter) => (field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
  };

  const handleCalculate = (mode) => {
    setCalculatedState((prev) => ({ ...prev, [mode]: true }));
  };

  const handleReset = (mode) => {
    setCalculatedState((prev) => ({ ...prev, [mode]: false }));
    switch (mode) {
      case "profesi":
      case "penghasilan":
        setProfesi(INITIAL_PROFESI);
        break;
      case "emas":
        setEmas(INITIAL_EMAS);
        break;
      case "perak":
        setPerak(INITIAL_PERAK);
        break;
      case "perdagangan":
        setPerdagangan(INITIAL_PERDAGANGAN);
        break;
      case "perusahaan":
        setPerusahaan(INITIAL_PERUSAHAAN);
        break;
      case "tabungan":
      case "maal":
        setTabungan(INITIAL_TABUNGAN);
        break;
      case "pertanian":
        setPertanian(INITIAL_PERTANIAN);
        break;
      default:
        break;
    }
  };

  const currentResult = useMemo(() => {
    switch (activeMode) {
      case "profesi":
      case "penghasilan":
        return calculateZakatProfesi(profesi);
      case "emas":
        return calculateZakatEmas(emas);
      case "perak":
        return calculateZakatPerak(perak);
      case "perdagangan":
        return calculateZakatPerdagangan(perdagangan);
      case "perusahaan":
        return calculateZakatPerusahaan(perusahaan);
      case "tabungan":
      case "maal":
        return calculateZakatTabungan(tabungan);
      case "pertanian":
        return calculateZakatPertanian(pertanian);
      default:
        return null;
    }
  }, [
    activeMode,
    profesi,
    emas,
    perak,
    perdagangan,
    perusahaan,
    tabungan,
    pertanian,
  ]);

  const handlePay = () => {
    if (!currentResult || currentResult.zakatAmount <= 0) return;
    const targetUrl = `/zakat/bayar?amount=${currentResult.zakatAmount}&type=${currentResult.categoryKey}&source=calculator`;
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
    <div className="space-y-8">
      <div className="flex justify-center">
        <ZakatModeSelector
          activeMode={activeMode}
          onSelectMode={setActiveMode}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-lg border border-slate-200 shadow-xs">
          {(activeMode === "profesi" || activeMode === "penghasilan") && (
            <ZakatProfesiForm
              values={profesi}
              onChange={updateField(setProfesi)}
              onSubmit={() => handleCalculate("profesi")}
              onReset={() => handleReset("profesi")}
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

          {activeMode === "perak" && (
            <ZakatPerakForm
              values={perak}
              onChange={updateField(setPerak)}
              onSubmit={() => handleCalculate("perak")}
              onReset={() => handleReset("perak")}
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

          {activeMode === "perusahaan" && (
            <ZakatPerusahaanForm
              values={perusahaan}
              onChange={updateField(setPerusahaan)}
              onSubmit={() => handleCalculate("perusahaan")}
              onReset={() => handleReset("perusahaan")}
            />
          )}

          {(activeMode === "tabungan" || activeMode === "maal") && (
            <ZakatTabunganForm
              values={tabungan}
              onChange={updateField(setTabungan)}
              onSubmit={() => handleCalculate("tabungan")}
              onReset={() => handleReset("tabungan")}
            />
          )}

          {activeMode === "pertanian" && (
            <ZakatPertanianForm
              values={pertanian}
              onChange={updateField(setPertanian)}
              onSubmit={() => handleCalculate("pertanian")}
              onReset={() => handleReset("pertanian")}
            />
          )}
        </div>

        <div className="lg:col-span-5 sticky top-24">
          <ZakatResultPanel
            result={currentResult}
            hasCalculated={calculatedState[activeMode]}
            onPay={handlePay}
          />
        </div>
      </div>

      <ZakatGuideTable />
    </div>
  );
}
