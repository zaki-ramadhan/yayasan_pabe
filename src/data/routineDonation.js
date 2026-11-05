import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const PRESET_AMOUNTS = [10000, 25000, 50000, 100000, 250000];

export const DAYS_OF_WEEK = [
  { id: "senin", label: "Senin" },
  { id: "selasa", label: "Selasa" },
  { id: "rabu", label: "Rabu" },
  { id: "kamis", label: "Kamis" },
  { id: "jumat", label: "Jumat" },
  { id: "sabtu", label: "Sabtu" },
  { id: "minggu", label: "Minggu" },
];

export const FREQUENCY_OPTIONS = [
  { value: "WEEKLY", label: "Setiap Pekan (Pilih Hari)" },
  { value: "MONTHLY", label: "Setiap Bulan (Pilih Tanggal)" },
];

export const ROUTINE_TYPE_OPTIONS = [
  {
    value: "AUTO_DONATION",
    title: "Donasi otomatis (Invoice email)",
    desc: "Sistem otomatis membuatkan invoice & QRIS resmi yang dikirimkan langsung ke email Anda.",
  },
  {
    value: "REMINDER_ONLY",
    title: "Pengingat email saja",
    desc: "Sistem mengirimkan email pengingat saat jadwal tiba (tanpa membuat tagihan otomatis).",
  },
];

export function normalizeFrequency(freq) {
  if (freq === "MONTHLY_PAYDAY" || freq === "MONTHLY") return "MONTHLY";
  if (freq === "WEEKLY_FRIDAY" || freq === "WEEKLY") return "WEEKLY";
  // Fallback aman untuk data historis agar hemat kuota email
  return "WEEKLY";
}

export function formatRoutineSchedule(item) {
  if (!item) return "Setiap Hari";
  const freq = normalizeFrequency(item.frequency);

  if (freq === "DAILY") {
    return "Setiap Hari";
  }

  if (freq === "WEEKLY") {
    const dayObj = DAYS_OF_WEEK.find((d) => d.id === (item.selectedDay || "jumat"));
    const dayLabel = dayObj ? dayObj.label : "Jumat";
    return `Setiap Pekan (${dayLabel})`;
  }

  if (freq === "MONTHLY") {
    let dateStr = "1";
    if (item.monthlyDate) {
      try {
        dateStr = format(new Date(item.monthlyDate), "d MMMM", { locale: idLocale });
      } catch {
        dateStr = "1";
      }
    }
    return `Setiap Bulan (Tgl ${dateStr})`;
  }

  return "Setiap Hari";
}
