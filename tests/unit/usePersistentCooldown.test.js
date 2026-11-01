import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getRemainingCooldownSeconds,
  setPersistentCooldown,
  clearPersistentCooldown,
} from "@/hooks/usePersistentCooldown";

describe("usePersistentCooldown Storage Helpers Unit Tests", () => {
  const TEST_KEY = "test_cooldown_key";
  let storage = {};

  beforeEach(() => {
    storage = {};
    const mockSessionStorage = {
      getItem: (key) => storage[key] || null,
      setItem: (key, val) => {
        storage[key] = String(val);
      },
      removeItem: (key) => {
        delete storage[key];
      },
      clear: () => {
        storage = {};
      },
    };

    vi.stubGlobal("window", {});
    vi.stubGlobal("sessionStorage", mockSessionStorage);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("mengembalikan 0 jika sessionStorage kosong", () => {
    expect(getRemainingCooldownSeconds(TEST_KEY)).toBe(0);
  });

  it("menyimpan dan menghitung sisa waktu cooldown secara akurat", () => {
    setPersistentCooldown(TEST_KEY, 60);

    expect(getRemainingCooldownSeconds(TEST_KEY)).toBe(60);

    // Maju 15 detik
    vi.advanceTimersByTime(15000);
    expect(getRemainingCooldownSeconds(TEST_KEY)).toBe(45);

    // Maju 45 detik lagi (total 60 detik)
    vi.advanceTimersByTime(45000);
    expect(getRemainingCooldownSeconds(TEST_KEY)).toBe(0);
  });

  it("mereset cooldown saat clearPersistentCooldown dipanggil", () => {
    setPersistentCooldown(TEST_KEY, 30);
    expect(getRemainingCooldownSeconds(TEST_KEY)).toBe(30);

    clearPersistentCooldown(TEST_KEY);
    expect(getRemainingCooldownSeconds(TEST_KEY)).toBe(0);
  });

  it("menangani key tidak valid atau kosong secara aman", () => {
    expect(getRemainingCooldownSeconds("")).toBe(0);
    expect(getRemainingCooldownSeconds(null)).toBe(0);
  });
});
