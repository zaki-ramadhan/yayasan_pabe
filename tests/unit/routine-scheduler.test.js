import { describe, it, expect } from "vitest";
import {
  normalizeWhatsAppNumber,
  isRoutineScheduledForNow,
  getRoutineExecutionKey,
} from "@/lib/routineSchedulerHelper";
import { buildRoutineWhatsAppMessage } from "@/services/whatsapp";

describe("Routine Scheduler Helper", () => {
  it("normalizes Indonesian phone numbers into international WhatsApp format", () => {
    expect(normalizeWhatsAppNumber("081234567890")).toBe("6281234567890");
    expect(normalizeWhatsAppNumber("81234567890")).toBe("6281234567890");
    expect(normalizeWhatsAppNumber("+62 812-3456-7890")).toBe("6281234567890");
    expect(normalizeWhatsAppNumber("")).toBe("");
  });

  it("generates deterministic execution key for idempotency", () => {
    const testDate = new Date("2026-10-26T05:00:00Z");
    const key = getRoutineExecutionKey("cuid_test_123", testDate);
    expect(key).toContain("ROUTINE_EXEC_cuid_test_123_");
  });

  it("correctly identifies active daily routines matching target hour", () => {
    // 05:00 WIB is 22:00 UTC previous day (UTC+7)
    const mockWib0500 = new Date("2026-10-25T22:00:00Z");

    const dailyRoutine = {
      id: "test1",
      status: "ACTIVE",
      frequency: "DAILY",
      reminderTime: "05:00",
    };

    expect(isRoutineScheduledForNow(dailyRoutine, mockWib0500)).toBe(true);

    // Mismatched hour (e.g. 06:00 WIB)
    const mockWib0600 = new Date("2026-10-25T23:00:00Z");
    expect(isRoutineScheduledForNow(dailyRoutine, mockWib0600)).toBe(false);
  });

  it("ignores paused or cancelled routines", () => {
    const mockWib0500 = new Date("2026-10-25T22:00:00Z");
    const pausedRoutine = {
      id: "test2",
      status: "PAUSED",
      frequency: "DAILY",
      reminderTime: "05:00",
    };
    expect(isRoutineScheduledForNow(pausedRoutine, mockWib0500)).toBe(false);
  });
});

describe("Routine WhatsApp Message Builder", () => {
  it("builds auto-donation invoice message with link and formatted rupiah", () => {
    const msg = buildRoutineWhatsAppMessage({
      donorName: "Ahmad",
      programTitle: "Bimbel Yatim PABE",
      amount: 50000,
      routineType: "AUTO_DONATION",
      actionUrl: "https://pabe.or.id/invoice/INV-123",
      invoiceId: "INV-123",
    });

    expect(msg).toContain("Ahmad");
    expect(msg).toContain("Bimbel Yatim PABE");
    expect(msg).toContain("Rp");
    expect(msg).toContain("50.000");
    expect(msg).toContain("INV-123");
    expect(msg).toContain("https://pabe.or.id/invoice/INV-123");
  });

  it("builds friendly reminder-only message when auto invoice is disabled", () => {
    const msg = buildRoutineWhatsAppMessage({
      donorName: "Hamba Allah",
      programTitle: "Sedekah Subuh",
      amount: 25000,
      routineType: "REMINDER_ONLY",
      actionUrl: "https://pabe.or.id/campaign/sedekah-subuh",
    });

    expect(msg).toContain("Sahabat Kebaikan");
    expect(msg).toContain("Sedekah Subuh");
    expect(msg).toContain("https://pabe.or.id/campaign/sedekah-subuh");
  });
});
