/**
 * Domain constants for WhatsApp Notification Queue and Logs.
 */

export const QUEUE_STATUS = {
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  SENT: "SENT",
  FAILED: "FAILED",
};

export const VALID_QUEUE_STATUSES = Object.values(QUEUE_STATUS);

export const NOTIFICATION_TYPE = {
  ROUTINE_INVOICE: "ROUTINE_INVOICE",
  ROUTINE_REMINDER: "ROUTINE_REMINDER",
  ROUTINE_COMPLETION: "ROUTINE_COMPLETION",
};

export const NOTIFICATION_PROVIDER = {
  MOCK: "mock",
  META: "meta",
  FONNTE: "fonnte",
};

export const QUEUE_CONFIG = {
  DEFAULT_MAX_ATTEMPTS: 3,
  DEFAULT_BATCH_SIZE: 15,
  // Delay dalam menit untuk setiap percobaan ulang (retry backoff)
  RETRY_DELAYS_MINUTES: [5, 15, 60],
};
