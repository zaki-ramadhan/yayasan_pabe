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
