import { getDateKey, ID_DAYS } from "@/lib/dateUtils";

export { normalizeWhatsAppNumber } from "@/lib/whatsappUtils";

/**
 * Checks if a routine donation schedule matches the current target time (in WIB).
 * @param {object} routine - RoutineDonation record from Prisma
 * @param {Date} [currentTime=new Date()]
 * @returns {boolean}
 */
export function isRoutineScheduledForNow(routine, currentTime = new Date()) {
  if (!routine || routine.status !== "ACTIVE") return false;

  // Evaluasi masa berlaku jika opsi rentang tanggal aktif
  if (routine.hasCustomPeriod) {
    if (routine.startDate) {
      const start = new Date(routine.startDate);
      start.setHours(0, 0, 0, 0);
      if (currentTime < start) return false;
    }
    if (routine.endDate) {
      const end = new Date(routine.endDate);
      end.setHours(23, 59, 59, 999);
      if (currentTime > end) return false;
    }
  }

  const wibTime = new Date(currentTime.getTime() + (7 * 60 + currentTime.getTimezoneOffset()) * 60000);
  const currentHour = wibTime.getHours();
  const currentMinute = wibTime.getMinutes();

  // Parse reminderTime (format "HH:mm", defaults to "05:00")
  const reminderTime = routine.reminderTime || "05:00";
  const [targetHourStr] = reminderTime.split(":");
  const targetHour = parseInt(targetHourStr, 10);

  // Cocokkan jam target (toleransi run dalam window 1 jam cron)
  if (currentHour !== targetHour) {
    return false;
  }

  const frequency = (routine.frequency || "DAILY").toUpperCase();

  if (frequency === "DAILY") {
    return true;
  }

  if (frequency === "WEEKLY") {
    const currentDayName = ID_DAYS[wibTime.getDay()]; // e.g. "Jumat"
    if (!routine.selectedDay) return false;
    return routine.selectedDay.toLowerCase() === currentDayName.toLowerCase();
  }

  if (frequency === "MONTHLY") {
    const currentDate = wibTime.getDate(); // 1 - 31
    if (routine.monthlyDate) {
      const targetDate = new Date(routine.monthlyDate).getDate();
      return currentDate === targetDate;
    }
    // Default fallback jika tidak ada tanggal spesifik: tanggal 1 tiap bulan
    return currentDate === 1;
  }

  return false;
}

/**
 * Generates an idempotency execution key for a routine schedule on a given date.
 * Format: "ROUTINE_EXEC_<id>_<YYYY-MM-DD>"
 * @param {string} routineId
 * @param {Date} [date=new Date()]
 * @returns {string}
 */
export function getRoutineExecutionKey(routineId, date = new Date()) {
  const dateKey = getDateKey(date);
  return `ROUTINE_EXEC_${routineId}_${dateKey}`;
}
