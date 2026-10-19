import { formatDate } from "@/lib/formatters";

/**
 * Returns a YYYY-MM-DD key string in WIB timezone from a date input.
 */
export function getDateKey(dateInput) {
  if (!dateInput) return "unknown";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "unknown";
  const wib = new Date(date.getTime() + (7 * 60 + date.getTimezoneOffset()) * 60000);
  const y = wib.getFullYear();
  const m = String(wib.getMonth() + 1).padStart(2, "0");
  const d = String(wib.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const ID_DAYS = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

/**
 * Returns a human-readable date badge label ala WhatsApp:
 * - Hari ini: "Hari Ini"
 * - Kemarin: "Kemarin"
 * - 2-6 hari yang lalu: Nama hari saja (e.g. "Minggu", "Sabtu", dst)
 * - 7 hari atau lebih lampau: Tanggal saja tanpa nama hari (e.g. "12 Oktober 2026")
 */
export function getDateBadgeLabel(dateInput) {
  if (!dateInput) return "Lainnya";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "Lainnya";

  const now = new Date();
  const nowWIB = new Date(now.getTime() + (7 * 60 + now.getTimezoneOffset()) * 60000);
  const targetWIB = new Date(date.getTime() + (7 * 60 + date.getTimezoneOffset()) * 60000);

  // Normalisasi ke jam 00:00:00 untuk perbandingan hari kalender secara akurat
  const startOfNow = new Date(nowWIB.getFullYear(), nowWIB.getMonth(), nowWIB.getDate());
  const startOfTarget = new Date(targetWIB.getFullYear(), targetWIB.getMonth(), targetWIB.getDate());

  const diffMs = startOfNow.getTime() - startOfTarget.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hari Ini";
  if (diffDays === 1) return "Kemarin";
  if (diffDays >= 2 && diffDays <= 6) {
    return ID_DAYS[targetWIB.getDay()];
  }

  // 7 hari atau lebih lama: hanya tanggal dengan singkatan nama bulan (e.g. "12 Okt 2026")
  return formatDate(date, { month: "short", withDay: false });
}

/**
 * Returns clock time string (e.g. "14:30" or "14:30:45") in WIB timezone from a date input.
 */
export function formatClockTime(dateInput, { withSeconds = false } = {}) {
  if (!dateInput) return withSeconds ? "--:--:--" : "--:--";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return withSeconds ? "--:--:--" : "--:--";
  const wib = new Date(date.getTime() + (7 * 60 + date.getTimezoneOffset()) * 60000);
  const hours = String(wib.getHours()).padStart(2, "0");
  const minutes = String(wib.getMinutes()).padStart(2, "0");
  if (withSeconds) {
    const seconds = String(wib.getSeconds()).padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
  }
  return `${hours}:${minutes}`;
}

