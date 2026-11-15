import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  shouldSendStatusEmail,
  clearEmailDispatchHistory,
} from "@/lib/emailDispatchGuard";

describe("Email Dispatch Guard (Anti-Spam & Quota Protector)", () => {
  beforeEach(() => {
    clearEmailDispatchHistory();
    vi.restoreAllMocks();
  });

  it("mengizinkan pengiriman email pertama kali untuk status tertentu", () => {
    const allowed = shouldSendStatusEmail("budi@example.com", "APPROVED");
    expect(allowed).toBe(true);
  });

  it("menolak pengiriman email duplikat untuk email dan status yang sama dalam kurun waktu cooldown", () => {
    shouldSendStatusEmail("budi@example.com", "APPROVED");
    const duplicate = shouldSendStatusEmail("budi@example.com", "APPROVED");
    expect(duplicate).toBe(false);
  });

  it("tetap mengizinkan pengiriman jika status berbeda (misal APPROVED lalu REJECTED)", () => {
    shouldSendStatusEmail("budi@example.com", "APPROVED");
    const differentStatus = shouldSendStatusEmail("budi@example.com", "REJECTED");
    expect(differentStatus).toBe(true);
  });

  it("tetap mengizinkan pengiriman untuk alamat email yang berbeda", () => {
    shouldSendStatusEmail("budi@example.com", "APPROVED");
    const otherUser = shouldSendStatusEmail("siti@example.com", "APPROVED");
    expect(otherUser).toBe(true);
  });

  it("menormalkan perbandingan email dan status tanpa terpengaruh huruf besar/kecil atau spasi", () => {
    shouldSendStatusEmail("  Budi@example.com ", "approved");
    const duplicate = shouldSendStatusEmail("budi@example.com", "APPROVED");
    expect(duplicate).toBe(false);
  });

  it("mengizinkan kembali pengiriman setelah masa cooldown berakhir", () => {
    const shortCooldownMs = 100;
    const now = Date.now();
    vi.spyOn(Date, "now").mockReturnValue(now);

    shouldSendStatusEmail("budi@example.com", "APPROVED", shortCooldownMs);

    // Majukan waktu melewati cooldown
    vi.spyOn(Date, "now").mockReturnValue(now + shortCooldownMs + 10);
    const afterCooldown = shouldSendStatusEmail("budi@example.com", "APPROVED", shortCooldownMs);
    expect(afterCooldown).toBe(true);
  });

  it("menolak input email atau status yang kosong / tidak valid", () => {
    expect(shouldSendStatusEmail("", "APPROVED")).toBe(false);
    expect(shouldSendStatusEmail("budi@example.com", "")).toBe(false);
    expect(shouldSendStatusEmail(null, null)).toBe(false);
  });
});

