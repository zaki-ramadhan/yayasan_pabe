"use client";

import { TimeInput24Hour } from "@/components/ui/TimeInput24Hour";

/**
 * Sub-komponen pemilihan jam pengingat notifikasi donasi rutin (format 24 jam)
 * @param {object} props
 * @param {object} props.item
 * @param {Function} props.onChange
 * @param {boolean} [props.isFirstIndex]
 */
export function RoutineReminderTimePicker({ item, onChange, isFirstIndex = false }) {
  return (
    <div
      id={isFirstIndex ? "tour-schedule-time" : undefined}
      className="space-y-1.5 pt-2 border-t border-slate-100"
    >
      <label className="text-sm font-semibold text-slate-800 block">
        Jam pengingat (WIB)
      </label>
      <TimeInput24Hour
        value={item.reminderTime || "05:00"}
        onChange={(newTime) => onChange(item.id, "reminderTime", newTime)}
      />
      <p className="mt-1 text-xs text-slate-600 italic font-normal">
        *Notifikasi otomatis akan dikirimkan pada jam yang ditentukan (Format 24 Jam).
      </p>
    </div>
  );
}
