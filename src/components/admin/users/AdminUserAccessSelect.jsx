"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { FormField } from "@/components/ui/FormField";
import { STAFF_ACCESS_ROLES } from "@/constants/staffConstants";

/**
 * Komponen pemilihan Tingkat Hak Akses pengurus yayasan.
 *
 * @param {object} props
 * @param {string} props.value
 * @param {Function} props.onChange
 * @param {string} [props.error]
 * @param {boolean} [props.disabled=false]
 */
export function AdminUserAccessSelect({
  value,
  onChange,
  error,
  disabled = false,
}) {
  const currentRole = STAFF_ACCESS_ROLES.find((r) => r.value === value);

  return (
    <FormField
      label="Tingkat hak akses"
      required
      error={error}
      hint={currentRole ? currentRole.description : "Menentukan wewenang pengurus di sistem."}
    >
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full h-10 text-sm font-normal bg-white border border-slate-300 rounded-lg">
          <SelectValue placeholder="Pilih hak akses" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-slate-200 z-50">
          {STAFF_ACCESS_ROLES.map((roleOpt) => (
            <SelectItem
              key={roleOpt.value}
              value={roleOpt.value}
              className="cursor-pointer text-sm font-normal py-2"
            >
              {roleOpt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}
