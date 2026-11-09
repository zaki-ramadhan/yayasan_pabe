"use client";

import { Combobox } from "@/components/ui/Combobox";

/**
 * Combobox selector for routine donation campaign/program (lookup only)
 * @param {object} props
 * @param {object} props.item
 * @param {Array} props.campaignList
 * @param {object} props.selectedCampaign
 * @param {Function} props.onChange
 * @param {boolean} [props.isFirstIndex]
 */
export function RoutineProgramPicker({
  item,
  campaignList = [],
  selectedCampaign: _selectedCampaign,
  onChange,
  isFirstIndex = false,
}) {
  const options = (campaignList || []).map((camp) => ({
    value: camp.id,
    label: camp.title,
    category: camp.categoryName || "Program Umum",
    raw: camp,
  }));

  return (
    <div id={isFirstIndex ? "tour-program-picker" : undefined} className="space-y-1.5">
      <label className="text-sm font-semibold text-slate-800 block">
        Pilih program donasi
      </label>
      <Combobox
        options={options}
        value={item.campaignId}
        onChange={(val) => onChange(item.id, "campaignId", val)}
        placeholder="-- Silakan Pilih Program --"
        searchPlaceholder="Cari program atau kategori donasi..."
        emptyMessage="Data tidak ditemukan."
        searchThreshold={5}
      />
    </div>
  );
}
