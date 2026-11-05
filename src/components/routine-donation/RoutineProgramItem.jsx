"use client";

import { Trash2 } from "lucide-react";
import { isCampaignClosed } from "@/lib/formatters";
import { TimeInput24Hour } from "@/components/ui/TimeInput24Hour";
import { RoutineProgramPicker } from "./RoutineProgramPicker";
import { RoutineSchedulePicker } from "./RoutineSchedulePicker";
import { RoutineTypeSelector } from "./RoutineTypeSelector";
import { RoutineCustomPeriod } from "./RoutineCustomPeriod";
import { RoutineReminderTimePicker } from "./RoutineReminderTimePicker";
import { RoutineAutoDonationConfig } from "./RoutineAutoDonationConfig";
import {
  DAYS_OF_WEEK,
  FREQUENCY_OPTIONS,
  ROUTINE_TYPE_OPTIONS,
  normalizeFrequency,
  formatRoutineSchedule,
} from "@/data/routineDonation";

export {
  DAYS_OF_WEEK,
  FREQUENCY_OPTIONS,
  ROUTINE_TYPE_OPTIONS,
  normalizeFrequency,
  formatRoutineSchedule,
  TimeInput24Hour,
};

export function RoutineProgramItem({
  item,
  index,
  totalItems,
  campaigns = [],
  onRemove,
  onChange,
}) {
  const rawList = Array.isArray(campaigns) ? campaigns : [];
  const campaignList = rawList.filter((c) => !isCampaignClosed(c));
  const selectedCampaign = campaignList.find((c) => c.id === item.campaignId) || campaignList[0] || null;
  const currentRoutineType = item.routineType || "REMINDER_ONLY";
  const isAutoDonation = currentRoutineType === "AUTO_DONATION";

  return (
    <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs relative">
      <h2 className="text-base sm:text-lg font-semibold text-slate-950">
        Pilihan program &amp; jadwal donasi
      </h2>

      {/* Program Selector */}
      <RoutineProgramPicker
        item={item}
        campaignList={campaignList}
        selectedCampaign={selectedCampaign}
        onChange={onChange}
        isFirstIndex={index === 0}
      />

      {/* Schedule Picker (Frekuensi, Hari Pekanan, Tanggal Bulanan) */}
      <RoutineSchedulePicker
        item={item}
        onChange={onChange}
        isFirstIndex={index === 0}
      />

      {/* Model Pelaksanaan Donasi (Pengingat WA vs Auto-Invoice) */}
      <RoutineTypeSelector
        item={item}
        onChange={onChange}
        isFirstIndex={index === 0}
      />

      {/* Batas Waktu / Masa Berlaku Opsional */}
      <RoutineCustomPeriod item={item} onChange={onChange} />

      {/* Jam Pengingat (Format 24 Jam) */}
      <RoutineReminderTimePicker
        item={item}
        onChange={onChange}
        isFirstIndex={index === 0}
      />

      {/* Kondisional: Opsi Auto-Donation vs Mode Pengingat Email */}
      {isAutoDonation ? (
        <RoutineAutoDonationConfig item={item} onChange={onChange} />
      ) : (
        <div className="rounded-lg bg-blue-50/70 border border-blue-200/80 p-4 text-sm text-slate-700 space-y-1 pt-2 mt-2">
          <p className="font-semibold text-blue-950">Mode pengingat email aktif</p>
          <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            Sistem hanya akan mengirimkan pesan pengingat ke alamat email Anda setiap jadwal tiba. Anda dapat menentukan nominal dan menunaikan donasi melalui tautan aman yang dikirimkan.
          </p>
        </div>
      )}
    </div>
  );
}
