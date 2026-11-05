import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  R2_FREE_TIER_BYTES,
  STORAGE_STATUS,
  STORAGE_THRESHOLDS,
  calculateStorageHealth,
} from "@/lib/storageConstants";
import {
  getStorageOverview,
  invalidateStorageCache,
} from "@/services/adminStorageService";

describe("Storage Health & Alert System (Unit & Boundary Analysis)", () => {
  describe("calculateStorageHealth", () => {
    it("menghasilkan status NORMAL saat penggunaan di bawah 80%", () => {
      const halfStorage = R2_FREE_TIER_BYTES * 0.5;
      const result = calculateStorageHealth(halfStorage);

      expect(result.status).toBe(STORAGE_STATUS.NORMAL);
      expect(result.usagePercent).toBe(50);
      expect(result.isWarning).toBe(false);
      expect(result.isCritical).toBe(false);
      expect(result.remainingBytes).toBe(R2_FREE_TIER_BYTES * 0.5);
    });

    it("menghasilkan status NORMAL tepat di bawah ambang batas (79.99%)", () => {
      const justBelowWarning = R2_FREE_TIER_BYTES * 0.7999;
      const result = calculateStorageHealth(justBelowWarning);

      expect(result.status).toBe(STORAGE_STATUS.NORMAL);
      expect(result.usagePercent).toBe(79.99);
      expect(result.isWarning).toBe(false);
      expect(result.isCritical).toBe(false);
    });

    it("menghasilkan status WARNING tepat pada ambang batas 80.00%", () => {
      const warningThreshold = R2_FREE_TIER_BYTES * (STORAGE_THRESHOLDS.WARNING_PERCENT / 100);
      const result = calculateStorageHealth(warningThreshold);

      expect(result.status).toBe(STORAGE_STATUS.WARNING);
      expect(result.usagePercent).toBe(80);
      expect(result.isWarning).toBe(true);
      expect(result.isCritical).toBe(false);
    });

    it("menghasilkan status WARNING tepat di bawah batas kritis (94.99%)", () => {
      const justBelowCritical = R2_FREE_TIER_BYTES * 0.9499;
      const result = calculateStorageHealth(justBelowCritical);

      expect(result.status).toBe(STORAGE_STATUS.WARNING);
      expect(result.usagePercent).toBe(94.99);
      expect(result.isWarning).toBe(true);
      expect(result.isCritical).toBe(false);
    });

    it("menghasilkan status CRITICAL tepat pada ambang batas 95.00%", () => {
      const criticalThreshold = R2_FREE_TIER_BYTES * (STORAGE_THRESHOLDS.CRITICAL_PERCENT / 100);
      const result = calculateStorageHealth(criticalThreshold);

      expect(result.status).toBe(STORAGE_STATUS.CRITICAL);
      expect(result.usagePercent).toBe(95);
      expect(result.isWarning).toBe(false);
      expect(result.isCritical).toBe(true);
    });

    it("menangani kasus batas ekstrem kapasitas penuh dan terlampaui", () => {
      const overflowBytes = R2_FREE_TIER_BYTES * 1.2; // 120%
      const result = calculateStorageHealth(overflowBytes);

      expect(result.status).toBe(STORAGE_STATUS.CRITICAL);
      expect(result.usagePercent).toBe(100); // diclamp ke 100%
      expect(result.isCritical).toBe(true);
      expect(result.remainingBytes).toBe(0);
    });

    it("defensive: menangani input tidak valid (null, negatif, string)", () => {
      const nullResult = calculateStorageHealth(null);
      expect(nullResult.status).toBe(STORAGE_STATUS.NORMAL);
      expect(nullResult.usagePercent).toBe(0);

      const negativeResult = calculateStorageHealth(-500);
      expect(negativeResult.status).toBe(STORAGE_STATUS.NORMAL);
      expect(negativeResult.usagePercent).toBe(0);

      const stringResult = calculateStorageHealth("8589934592"); // 8 GB
      expect(stringResult.status).toBe(STORAGE_STATUS.WARNING);
      expect(stringResult.usagePercent).toBe(80);
    });
  });

  describe("adminStorageService getStorageOverview & Cache", () => {
    beforeEach(() => {
      invalidateStorageCache();
      delete process.env.MOCK_STORAGE_PERCENT;
    });

    afterEach(() => {
      invalidateStorageCache();
      delete process.env.MOCK_STORAGE_PERCENT;
    });

    it("menyertakan objek health deterministik dalam respon getStorageOverview", async () => {
      const overview = await getStorageOverview({ forceRefresh: true });

      expect(overview).toBeDefined();
      expect(overview.health).toBeDefined();
      expect(overview.health.status).toBeDefined();
      expect(typeof overview.health.usagePercent).toBe("number");
      expect(typeof overview.health.isWarning).toBe("boolean");
      expect(typeof overview.health.isCritical).toBe("boolean");
    });

    it("menghormati simulasi pengujian QA via MOCK_STORAGE_PERCENT", async () => {
      process.env.MOCK_STORAGE_PERCENT = "96";
      const overview = await getStorageOverview({ forceRefresh: true });

      expect(overview.health.status).toBe(STORAGE_STATUS.CRITICAL);
      expect(overview.health.isCritical).toBe(true);
      expect(overview.health.usagePercent).toBe(96);
    });

    it("memanfaatkan cache in-memory dan mengosongkannya via invalidateStorageCache", async () => {
      process.env.MOCK_STORAGE_PERCENT = "85";
      const firstCall = await getStorageOverview();
      expect(firstCall.health.usagePercent).toBe(85);

      // Ubah env mock, pemanggilan kedua harus tetap membaca cache
      process.env.MOCK_STORAGE_PERCENT = "97";
      const cachedCall = await getStorageOverview();
      expect(cachedCall.health.usagePercent).toBe(85);

      // Setelah cache di-invalidate, pemanggilan harus merefleksikan nilai baru
      invalidateStorageCache();
      const freshCall = await getStorageOverview();
      expect(freshCall.health.usagePercent).toBe(97);
    });
  });
});
