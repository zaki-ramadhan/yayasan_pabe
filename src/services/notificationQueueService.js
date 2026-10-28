import prisma from "@/lib/prisma";
import { QUEUE_STATUS, QUEUE_CONFIG, NOTIFICATION_TYPE } from "@/lib/notificationConstants";
import { normalizeWhatsAppNumber } from "@/lib/routineSchedulerHelper";

/**
 * Service Producer: Bertanggung jawab memasukkan tugas notifikasi ke tabel antrean (NotificationQueue).
 * Mengimplementasikan pencegahan duplikasi (Idempotency) dan validasi nomor penerima.
 */

/**
 * Memasukkan tugas notifikasi ke dalam antrean.
 *
 * @param {object} params
 * @param {string} [params.routineDonationId] - ID relasi ke jadwal donasi rutin
 * @param {string} params.type - Tipe notifikasi (ROUTINE_INVOICE, ROUTINE_REMINDER, ROUTINE_COMPLETION)
 * @param {string} params.recipientPhone - Nomor WhatsApp donatur
 * @param {object} params.payload - Payload data pesan (donorName, programTitle, amount, actionUrl, invoiceId)
 * @param {Date} [params.scheduledFor=new Date()] - Waktu eksekusi yang dijadwalkan
 * @param {string} params.idempotencyKey - Kunci unik pencegah duplikasi tugas
 * @param {number} [params.maxAttempts] - Batas maksimal percobaan pengiriman
 * @returns {Promise<{ created: boolean, queueItem: object }>}
 */
export async function enqueueNotification({
  routineDonationId = null,
  type = NOTIFICATION_TYPE.ROUTINE_INVOICE,
  recipientPhone,
  payload = {},
  scheduledFor = new Date(),
  idempotencyKey,
  maxAttempts = QUEUE_CONFIG.DEFAULT_MAX_ATTEMPTS,
}) {
  const normalizedPhone = normalizeWhatsAppNumber(recipientPhone);
  if (!normalizedPhone) {
    throw new Error(`Nomor telepon penerima tidak valid: ${recipientPhone}`);
  }

  if (!idempotencyKey) {
    throw new Error("idempotencyKey wajib disertakan untuk memastikan keunikan antrean.");
  }

  // 1. Cek apakah tugas dengan idempotencyKey ini sudah pernah dibuat
  const existing = await prisma.notificationQueue.findUnique({
    where: { idempotencyKey },
  });

  if (existing) {
    return { created: false, queueItem: existing };
  }

  // 2. Buat antrean baru dengan status PENDING
  const queueItem = await prisma.notificationQueue.create({
    data: {
      routineDonationId,
      type,
      recipientPhone: normalizedPhone,
      payload,
      status: QUEUE_STATUS.PENDING,
      attempts: 0,
      maxAttempts,
      scheduledFor,
      idempotencyKey,
    },
  });

  return { created: true, queueItem };
}

/**
 * Mengambil statistik antrean notifikasi (untuk dashboard admin).
 */
export async function getQueueStats() {
  const [pending, processing, sent, failed] = await Promise.all([
    prisma.notificationQueue.count({ where: { status: QUEUE_STATUS.PENDING } }),
    prisma.notificationQueue.count({ where: { status: QUEUE_STATUS.PROCESSING } }),
    prisma.notificationQueue.count({ where: { status: QUEUE_STATUS.SENT } }),
    prisma.notificationQueue.count({ where: { status: QUEUE_STATUS.FAILED } }),
  ]);

  return { pending, processing, sent, failed, total: pending + processing + sent + failed };
}
