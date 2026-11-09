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
  canAssignSuperAdmin = false,
}) {
  const availableRoles = STAFF_ACCESS_ROLES.filter((r) => {
    if (r.value === "SUPER_ADMIN" && !canAssignSuperAdmin) return false;
    return true;
  });

  const currentRole = availableRoles.find((r) => r.value === value) || availableRoles[0];

  return (
    <FormField
      label="Tingkat hak akses dashboard"
      required
      error={error}
      hint={currentRole ? currentRole.description : "Menentukan wewenang pengurus di sistem."}
    >
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="w-full h-10 text-sm font-normal bg-white border border-slate-300 rounded-lg">
          <SelectValue placeholder="Pilih hak akses" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-slate-200 z-50">
          {availableRoles.map((roleOpt) => (
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
