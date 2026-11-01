"use client";

import { useState, useEffect } from "react";
import { FormField } from "@/components/ui/FormField";
import { CreatableCombobox } from "@/components/ui/CreatableCombobox";
import { DEFAULT_STRUCTURAL_TITLES } from "@/constants/staffConstants";
import { safeFetch } from "@/lib/safeFetch";

/**
 * Komponen Creatable Combobox untuk pemilihan atau penambahan Jabatan Struktural pengurus.
 * Mengambil saran jabatan yang sudah ada di database dan mendukung pengetikan jabatan kustom.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} [props.error]
 * @param {boolean} [props.disabled=false]
 */
export function AdminUserTitleCombobox({
  value,
  onChange,
  error,
  hint = "Contoh: Ketua Dewan Pembina, Sekretaris.",
  required = true,
  disabled = false,
}) {
  const [options, setOptions] = useState(DEFAULT_STRUCTURAL_TITLES);

  useEffect(() => {
    let isMounted = true;

    async function loadTitles() {
      try {
        const res = await safeFetch("/api/admin/users/titles");
        if (isMounted && res?.success && Array.isArray(res.data)) {
          setOptions(res.data);
        }
      } catch (err) {
        console.warn("Menggunakan opsi jabatan default:", err);
      }
    }

    loadTitles();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateNewTitle = (newTerm) => {
    const trimmed = newTerm.trim();
    if (!trimmed) return;
    setOptions((prev) => (prev.includes(trimmed) ? prev : [...prev, trimmed]));
    return trimmed;
  };

  return (
    <FormField
      label="Jabatan struktural"
      required={required}
      error={error}
      hint={hint}
    >
      <CreatableCombobox
        options={options}
        value={value}
        onChange={(val) => onChange(val)}
        onCreate={handleCreateNewTitle}
        placeholder="Pilih atau ketik jabatan..."
        searchPlaceholder="Cari atau ketik jabatan baru..."
        createPrefix="Gunakan jabatan baru"
        disabled={disabled}
        className="w-full"
      />
    </FormField>
  );
}
