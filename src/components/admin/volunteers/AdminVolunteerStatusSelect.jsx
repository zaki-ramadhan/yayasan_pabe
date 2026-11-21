"use client";

import { StatusSelectBadge } from "@/components/ui/StatusSelectBadge";

export const VOLUNTEER_STATUS_OPTIONS = [
  { value: "PENDING", label: "Menunggu", color: "amber" },
  { value: "REVIEWED", label: "Ditinjau", color: "sky" },
  { value: "ACCEPTED", label: "Diterima", color: "emerald" },
  { value: "REJECTED", label: "Ditolak", color: "rose" },
];

/**
 * Backward compatibility export
 */
export const VOLUNTEER_STATUSES = VOLUNTEER_STATUS_OPTIONS;

const VOLUNTEER_ALIAS_MAP = {
  APPROVED: "ACCEPTED",
};

/**
 * Status selector interaktif untuk tabel pendaftar relawan (Clean Chip, Solid).
 * Membungkus komponen reusable StatusSelectBadge dengan preset status relawan.
 */
export function AdminVolunteerStatusSelect({
  status = "PENDING",
  onStatusChange,
  isUpdating = false,
  disabled = false,
}) {
  return (
    <StatusSelectBadge
      value={status}
      options={VOLUNTEER_STATUS_OPTIONS}
      onChange={onStatusChange}
      aliasMap={VOLUNTEER_ALIAS_MAP}
      variant="solid"
      size="sm"
      isUpdating={isUpdating}
      disabled={disabled}
    />
  );
}
