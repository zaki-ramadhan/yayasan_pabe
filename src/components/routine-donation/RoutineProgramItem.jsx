"use client";

import { Trash2 } from "lucide-react";
import { isCampaignClosed } from "@/lib/formatters";
import { TimeInput24Hour } from "@/components/ui/TimeInput24Hour";
import { RoutineProgramPicker } from "./RoutineProgramPicker";
import { RoutineSchedulePicker } from "./RoutineSchedulePicker";
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

      {/* Jam Pengingat (Format 24 Jam) */}
      <RoutineReminderTimePicker
        item={item}
        onChange={onChange}
        isFirstIndex={index === 0}
      />

      {/* Batas Waktu / Masa Berlaku Opsional */}
      <RoutineCustomPeriod item={item} onChange={onChange} />

      {/* Pengaturan Nominal Donasi Otomatis (Invoice Email) */}
      <RoutineAutoDonationConfig item={item} onChange={onChange} />
    </div>
  );
}
