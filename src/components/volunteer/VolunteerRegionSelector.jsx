"use client";

import * as React from "react";
import { FormField } from "@/components/ui/FormField";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import {
  PROVINCES,
  getCitiesByProvince,
  findProvinceByCity,
} from "@/data/indonesiaRegions";
import { sanitizeCity } from "@/lib/security";

/**
 * Sub-widget pemilih wilayah domisili 2 tahap berjenjang (Provinsi -> Kota/Kabupaten).
 * Menggunakan dataset master 38 Provinsi & 514 Kota/Kabupaten Indonesia (offline-first).
 * Menggunakan derived state murni tanpa efek berantai untuk performa optimal di React 19.
 *
 * @param {object} props
 * @param {string} props.selectedCity - Kota/kabupaten yang sedang dipilih
 * @param {Function} props.onCityChange - Callback saat kota/kabupaten berubah
 * @param {string} [props.error] - Pesan error validasi untuk field domisili
 * @param {Function} [props.onClearError] - Callback opsional pembersih error
 * @param {boolean} [props.disabled=false] - Status disabled form
 */
export function VolunteerRegionSelector({
  selectedCity = "",
  onCityChange,
  error,
  onClearError,
  disabled = false,
}) {
  // Simpan provinsi yang dipilih manual oleh pengguna (null jika belum pernah diubah secara manual)
  const [manualProvince, setManualProvince] = React.useState(null);

  // Derived state: gunakan pilihan manual jika ada, atau auto-resolve dari selectedCity
  const effectiveProvince = React.useMemo(() => {
    if (manualProvince !== null) {
      return manualProvince;
    }
    return findProvinceByCity(selectedCity) || "";
  }, [manualProvince, selectedCity]);

  // Daftar kota/kabupaten turunan sesuai provinsi yang efektif aktif
  const citiesInProvince = React.useMemo(() => {
    return getCitiesByProvince(effectiveProvince);
  }, [effectiveProvince]);

  // Handler saat pengguna memilih provinsi
  const handleProvinceChange = (newProvince) => {
    setManualProvince(newProvince);
    if (onClearError) onClearError();

    // Reset pilihan kota jika kota sebelumnya bukan bagian dari provinsi baru
    if (selectedCity) {
      const validCities = getCitiesByProvince(newProvince);
      const isStillInProvince = validCities.some(
        (c) => c.toLowerCase() === selectedCity.toLowerCase()
      );
      if (!isStillInProvince) {
        onCityChange("");
      }
    }
  };

  // Handler saat pengguna memilih kota dari opsi dropdown
  const handleCityChange = (cityValue) => {
    onCityChange(cityValue);
    if (onClearError) onClearError();
  };

  // Handler penambahan kota kustom (creatable / free-solo) jika tidak ada di daftar
  const handleCreateCity = (rawInput) => {
    const clean = sanitizeCity(rawInput).trim();
    if (clean) {
      onCityChange(clean);
      if (onClearError) onClearError();
      return clean;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* 1. Field Pilihan Provinsi */}
      <FormField
        label="Provinsi domisili"
        required
      >
        <CreatableCombobox
          options={PROVINCES}
          value={effectiveProvince}
          onChange={handleProvinceChange}
          placeholder="Pilih provinsi..."
          searchPlaceholder="Cari provinsi..."
          emptyMessage="Provinsi tidak ditemukan."
          disabled={disabled}
          className="h-11 font-normal"
        />
      </FormField>

      {/* 2. Field Pilihan Kota / Kabupaten */}
      <FormField
        label="Kota / kabupaten domisili"
        required
        error={error}
        hint={
          !effectiveProvince
            ? "Pilih provinsi terlebih dahulu."
            : undefined
        }
      >
        <CreatableCombobox
          options={citiesInProvince}
          value={selectedCity}
          onChange={handleCityChange}
          onCreate={handleCreateCity}
          placeholder={
            effectiveProvince
              ? "Pilih kota / kabupaten..."
              : "Pilih provinsi terlebih dahulu"
          }
          searchPlaceholder="Cari kota / kabupaten..."
          createPrefix="Gunakan kota"
          emptyMessage="Kota tidak ditemukan di provinsi ini. Ketik nama lalu tekan enter untuk gunakan opsi baru."
          disabled={disabled || !effectiveProvince}
          className="h-11 font-normal"
        />
      </FormField>
    </div>
  );
}

export default VolunteerRegionSelector;
