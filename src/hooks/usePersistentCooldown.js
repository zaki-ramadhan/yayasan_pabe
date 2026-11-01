"use client";

import { useState, useEffect, useCallback } from "react";

export function getRemainingCooldownSeconds(storageKey) {
  if (typeof window === "undefined" || !storageKey) return 0;
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return 0;
    const expiresAt = parseInt(raw, 10);
    const remaining = Math.ceil((expiresAt - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  } catch {
    return 0;
  }
}

export function setPersistentCooldown(storageKey, seconds) {
  if (typeof window === "undefined" || !storageKey) return;
  try {
    sessionStorage.setItem(storageKey, String(Date.now() + seconds * 1000));
  } catch {}
}

export function clearPersistentCooldown(storageKey) {
  if (typeof window === "undefined" || !storageKey) return;
  try {
    sessionStorage.removeItem(storageKey);
  } catch {}
}

/**
 * Hook terpusat untuk cooldown timer persisten berbasis timestamp di sessionStorage (SSOT & DRY).
 * Tetap aktif dan menghitung mundur secara akurat meskipun komponen di-unmount, modal ditutup, atau halaman di-refresh.
 *
 * @param {string} storageKey - Kunci unik di sessionStorage
 * @param {number} [defaultSeconds=60] - Durasi cooldown default dalam detik
 * @returns {{
 *   cooldown: number,
 *   isCoolingDown: boolean,
 *   startCooldown: (seconds?: number) => void,
 *   resetCooldown: () => void
 * }}
 */
export function usePersistentCooldown(storageKey, defaultSeconds = 60) {
  const getRemainingSeconds = useCallback(
    () => getRemainingCooldownSeconds(storageKey),
    [storageKey]
  );

  const [cooldown, setCooldown] = useState(() => getRemainingSeconds());

  // Sinkronisasi saat storageKey berubah
  useEffect(() => {
    setCooldown(getRemainingSeconds());
  }, [storageKey, getRemainingSeconds]);

  // Interval timer per detik saat cooldown aktif
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      const remaining = getRemainingSeconds();
      setCooldown(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown, getRemainingSeconds]);

  const startCooldown = useCallback(
    (seconds = defaultSeconds) => {
      setPersistentCooldown(storageKey, seconds);
      setCooldown(seconds);
    },
    [storageKey, defaultSeconds]
  );

  const resetCooldown = useCallback(() => {
    clearPersistentCooldown(storageKey);
    setCooldown(0);
  }, [storageKey]);

  return {
    cooldown,
    isCoolingDown: cooldown > 0,
    startCooldown,
    resetCooldown,
  };
}
