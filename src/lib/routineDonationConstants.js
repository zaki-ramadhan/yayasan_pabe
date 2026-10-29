/**
 * Domain constants for Routine Donations (Donasi Rutin)
 */

export const ROUTINE_STATUS = {
  ACTIVE: "ACTIVE",
  PAUSED: "PAUSED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
};

export const VALID_ROUTINE_STATUSES = Object.values(ROUTINE_STATUS);

export const ROUTINE_TYPE = {
  AUTO_DONATION: "AUTO_DONATION",
  REMINDER_ONLY: "REMINDER_ONLY",
};

export const ROUTINE_FREQUENCY = {
  DAILY: "DAILY",
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
};

import { parseThousandsToNumber } from "@/lib/formatters";

/**
 * Resolves the effective numeric amount for a routine donation program item,
 * whether provided as a formatted customAmount string or preset number.
 *
 * @param {object} program
 * @returns {number}
 */
export function getRoutineProgramAmount(program) {
  if (!program) return 0;
  if (program.customAmount) {
    return parseThousandsToNumber(program.customAmount);
  }
  return typeof program.amount === "number" ? program.amount : 0;
}
