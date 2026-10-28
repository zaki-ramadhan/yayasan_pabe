import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  enqueueNotification,
  getQueueStats,
} from "@/services/notificationQueueService";
import {
  processNotificationQueue,
  calculateNextRetryTime,
} from "@/services/notificationWorkerService";
import {
  QUEUE_STATUS,
  NOTIFICATION_TYPE,
  QUEUE_CONFIG,
} from "@/lib/notificationConstants";

// Mock Prisma Client
vi.mock("@/lib/prisma", () => {
  return {
    default: {
      notificationQueue: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        count: vi.fn(),
      },
      notificationLog: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    },
  };
});

// Mock WhatsApp Driver
vi.mock("@/services/whatsapp", () => {
  return {
    sendWhatsAppNotification: vi.fn().mockResolvedValue({
      success: true,
      provider: "mock",
      messageId: "mock-msg-123",
    }),
    sendWhatsAppCompletionNotification: vi.fn().mockResolvedValue({
      success: true,
      provider: "mock",
      messageId: "mock-msg-456",
    }),
  };
});

describe("Notification Queue & Worker Architecture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Producer: notificationQueueService.enqueueNotification", () => {
    it("berhasil memasukkan tugas baru ke tabel antrean dengan status PENDING", async () => {
      const prisma = (await import("@/lib/prisma")).default;

      prisma.notificationQueue.findUnique.mockResolvedValueOnce(null);
      prisma.notificationQueue.create.mockResolvedValueOnce({
        id: "queue-1",
        routineDonationId: "routine-10",
        type: NOTIFICATION_TYPE.ROUTINE_INVOICE,
        recipientPhone: "081234567890",
        payload: { donorName: "Budi", amount: 50000 },
        status: QUEUE_STATUS.PENDING,
        attempts: 0,
        maxAttempts: 3,
        idempotencyKey: "KEY_123",
      });

      const res = await enqueueNotification({
        routineDonationId: "routine-10",
        type: NOTIFICATION_TYPE.ROUTINE_INVOICE,
        recipientPhone: "081234567890",
        payload: { donorName: "Budi", amount: 50000 },
        idempotencyKey: "KEY_123",
      });

      expect(res.created).toBe(true);
      expect(res.queueItem.status).toBe(QUEUE_STATUS.PENDING);
      expect(prisma.notificationQueue.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            recipientPhone: "6281234567890",
            status: QUEUE_STATUS.PENDING,
            idempotencyKey: "KEY_123",
          }),
        })
      );
    });

    it("mencegah duplikasi antrean jika idempotencyKey sudah ada", async () => {
      const prisma = (await import("@/lib/prisma")).default;

      const existingItem = {
        id: "queue-existing",
        idempotencyKey: "KEY_DUPLICATE",
        status: QUEUE_STATUS.PENDING,
      };
      prisma.notificationQueue.findUnique.mockResolvedValueOnce(existingItem);

      const res = await enqueueNotification({
        recipientPhone: "081234567890",
        payload: {},
        idempotencyKey: "KEY_DUPLICATE",
      });

      expect(res.created).toBe(false);
      expect(res.queueItem.id).toBe("queue-existing");
      expect(prisma.notificationQueue.create).not.toHaveBeenCalled();
    });

    it("menolak nomor telepon tidak valid", async () => {
      await expect(
        enqueueNotification({
          recipientPhone: "123", // Terlalu pendek
          payload: {},
          idempotencyKey: "KEY_FAIL",
        })
      ).rejects.toThrow(/tidak valid/);
    });
  });

  describe("Consumer: notificationWorkerService.processNotificationQueue", () => {
    it("mengunci status, mengirim pesan WA, mengubah status ke SENT, dan mencatat log", async () => {
      const prisma = (await import("@/lib/prisma")).default;
      const { sendWhatsAppNotification } = await import("@/services/whatsapp");

      const mockQueue = [
        {
          id: "queue-task-1",
          recipientPhone: "081234567890",
          type: NOTIFICATION_TYPE.ROUTINE_INVOICE,
          payload: { donorName: "Siti", amount: 100000, invoiceId: "INV-01" },
          attempts: 0,
          maxAttempts: 3,
          status: QUEUE_STATUS.PENDING,
          scheduledFor: new Date(),
        },
      ];

      prisma.notificationQueue.findMany.mockResolvedValueOnce(mockQueue);
      prisma.notificationQueue.updateMany.mockResolvedValueOnce({ count: 1 });
      prisma.notificationQueue.update.mockResolvedValueOnce({ id: "queue-task-1", status: QUEUE_STATUS.SENT });
      prisma.notificationLog.create.mockResolvedValueOnce({ id: "log-1" });

      const summary = await processNotificationQueue({ batchSize: 10 });

      expect(summary.processed).toBe(1);
      expect(summary.succeeded).toBe(1);
      expect(summary.failed).toBe(0);

      // Verifikasi penguncian atomik
      expect(prisma.notificationQueue.updateMany).toHaveBeenCalledWith({
        where: { id: "queue-task-1", status: QUEUE_STATUS.PENDING },
        data: { status: QUEUE_STATUS.PROCESSING },
      });

      // Verifikasi pengiriman WA
      expect(sendWhatsAppNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "081234567890",
          donorName: "Siti",
        })
      );

      // Verifikasi update ke SENT
      expect(prisma.notificationQueue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "queue-task-1" },
          data: expect.objectContaining({ status: QUEUE_STATUS.SENT, attempts: 1 }),
        })
      );

      // Verifikasi pencatatan log
      expect(prisma.notificationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            queueId: "queue-task-1",
            status: "DELIVERED",
          }),
        })
      );
    });

    it("menangani kegagalan sementara dengan retry backoff jika attempts < maxAttempts", async () => {
      const prisma = (await import("@/lib/prisma")).default;
      const { sendWhatsAppNotification } = await import("@/services/whatsapp");

      sendWhatsAppNotification.mockRejectedValueOnce(new Error("Network timeout provider"));

      const mockQueue = [
        {
          id: "queue-fail-1",
          recipientPhone: "081234567890",
          type: NOTIFICATION_TYPE.ROUTINE_INVOICE,
          payload: { donorName: "Rudi" },
          attempts: 0,
          maxAttempts: 3,
          status: QUEUE_STATUS.PENDING,
          scheduledFor: new Date(),
        },
      ];

      prisma.notificationQueue.findMany.mockResolvedValueOnce(mockQueue);
      prisma.notificationQueue.updateMany.mockResolvedValueOnce({ count: 1 });
      prisma.notificationQueue.update.mockResolvedValueOnce({ id: "queue-fail-1" });
      prisma.notificationLog.create.mockResolvedValueOnce({ id: "log-fail-1" });

      const summary = await processNotificationQueue({ batchSize: 10 });

      expect(summary.processed).toBe(1);
      expect(summary.retried).toBe(1);
      expect(summary.failed).toBe(0);

      // Status harus dikembalikan ke PENDING dengan attempts = 1 untuk di-retry nanti
      expect(prisma.notificationQueue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "queue-fail-1" },
          data: expect.objectContaining({
            status: QUEUE_STATUS.PENDING,
            attempts: 1,
            lastError: "Network timeout provider",
          }),
        })
      );

      // Log FAILED harus tetap dicatat
      expect(prisma.notificationLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            queueId: "queue-fail-1",
            status: "FAILED",
            errorMessage: "Network timeout provider",
          }),
        })
      );
    });

    it("mengubah status menjadi FAILED permanen jika attempts sudah mencapai maxAttempts", async () => {
      const prisma = (await import("@/lib/prisma")).default;
      const { sendWhatsAppNotification } = await import("@/services/whatsapp");

      sendWhatsAppNotification.mockRejectedValueOnce(new Error("Nomor tidak terdaftar di WA"));

      const mockQueue = [
        {
          id: "queue-max-attempts",
          recipientPhone: "081234567890",
          type: NOTIFICATION_TYPE.ROUTINE_INVOICE,
          payload: { donorName: "Rudi" },
          attempts: 2, // Percobaan ke-3 berikutnya akan mencapai maxAttempts (3)
          maxAttempts: 3,
          status: QUEUE_STATUS.PENDING,
          scheduledFor: new Date(),
        },
      ];

      prisma.notificationQueue.findMany.mockResolvedValueOnce(mockQueue);
      prisma.notificationQueue.updateMany.mockResolvedValueOnce({ count: 1 });
      prisma.notificationQueue.update.mockResolvedValueOnce({ id: "queue-max-attempts" });
      prisma.notificationLog.create.mockResolvedValueOnce({ id: "log-max-fail" });

      const summary = await processNotificationQueue({ batchSize: 10 });

      expect(summary.processed).toBe(1);
      expect(summary.retried).toBe(0);
      expect(summary.failed).toBe(1);

      // Status harus menjadi FAILED permanen karena sudah mencapai maxAttempts
      expect(prisma.notificationQueue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "queue-max-attempts" },
          data: expect.objectContaining({
            status: QUEUE_STATUS.FAILED,
            attempts: 3,
          }),
        })
      );
    });
  });

  describe("Retry Backoff Calculation", () => {
    it("menghitung delay bertahap sesuai konfigurasi", () => {
      const now = Date.now();
      const retry1 = calculateNextRetryTime(1); // 5 menit
      const retry2 = calculateNextRetryTime(2); // 15 menit
      const retry3 = calculateNextRetryTime(3); // 60 menit

      expect(retry1.getTime()).toBeGreaterThanOrEqual(now + 4 * 60 * 1000);
      expect(retry2.getTime()).toBeGreaterThanOrEqual(now + 14 * 60 * 1000);
      expect(retry3.getTime()).toBeGreaterThanOrEqual(now + 59 * 60 * 1000);
    });
  });
});
