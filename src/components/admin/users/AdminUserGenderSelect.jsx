"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { GENDER_OPTIONS } from "@/constants/staffConstants";

/**
 * Komponen pemilihan Jenis Kelamin pengurus yayasan.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} [props.error]
 * @param {boolean} [props.disabled=false]
 */
export function AdminUserGenderSelect({
  value,
  onChange,
  error,
  disabled = false,
}) {
  return (
    <FormField
      label="Jenis kelamin"
      required
      error={error}
      hint="Digunakan untuk menentukan avatar default pada profil & struktur organisasi."
    >
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full h-10 text-sm font-normal bg-white border border-slate-300 rounded-lg">
          <SelectValue placeholder="Pilih jenis kelamin" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-slate-200 z-50">
          {GENDER_OPTIONS.map((g) => (
            <SelectItem
              key={g.value}
              value={g.value}
              className="cursor-pointer text-sm font-normal py-2"
            >
              {g.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
