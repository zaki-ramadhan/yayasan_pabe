"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { safeFetch } from "@/lib/safeFetch";

const DEFAULT_POLL_INTERVAL_MS = 3000;
const MAX_POLL_DURATION_MS = 300000; // 5 menit
const MAX_BACKOFF_INTERVAL_MS = 10000;

export function useDonationStatusPolling({
  invoiceId,
  currentStatus,
  onStatusChange,
  intervalMs = DEFAULT_POLL_INTERVAL_MS,
  maxDurationMs = MAX_POLL_DURATION_MS,
}) {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckedAt, setLastCheckedAt] = useState(null);
  const isCheckingRef = useRef(false);
  const consecutiveErrorsRef = useRef(0);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  const checkStatus = useCallback(async () => {
    if (!invoiceId || isCheckingRef.current || currentStatus !== "PENDING") {
      return;
    }

    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    // Safety timeout: hentikan polling jika sudah melebihi batas waktu maksimal
    if (Date.now() - startTimeRef.current > maxDurationMs) {
      return;
    }

    try {
      isCheckingRef.current = true;
      setIsChecking(true);

      const res = await safeFetch(`/api/donations?invoiceId=${encodeURIComponent(invoiceId)}`, {
        cache: "no-store",
      }, 5000);

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.success && json?.data?.status) {
          consecutiveErrorsRef.current = 0;
          setLastCheckedAt(new Date());

          const newStatus = json.data.status.toUpperCase();
          if (newStatus !== "PENDING") {
            onStatusChange?.(newStatus, json.data.paidAt || null);
          }
        }
      } else {
        consecutiveErrorsRef.current += 1;
      }
    } catch {
      consecutiveErrorsRef.current += 1;
    } finally {
      isCheckingRef.current = false;
      setIsChecking(false);
    }
  }, [invoiceId, currentStatus, maxDurationMs, onStatusChange]);

  // Loop Polling dengan Page Visibility & Backoff Handling
  useEffect(() => {
    if (!invoiceId || currentStatus !== "PENDING") {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    startTimeRef.current = Date.now();
    consecutiveErrorsRef.current = 0;

    const scheduleNextPoll = () => {
      if (currentStatus !== "PENDING") return;

      const backoffMultiplier = Math.min(consecutiveErrorsRef.current, 3);
      const delay = Math.min(
        intervalMs + backoffMultiplier * 2000,
        MAX_BACKOFF_INTERVAL_MS
      );

      timerRef.current = setTimeout(async () => {
        // Hanya eksekusi jika tab browser sedang aktif dilihat oleh donatur
        if (typeof document !== "undefined" && document.visibilityState === "visible") {
          await checkStatus();
        }
        scheduleNextPoll();
      }, delay);
    };

    scheduleNextPoll();

    // Trigger instant check saat pengguna kembali ke tab browser (misal setelah buka m-banking)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && currentStatus === "PENDING") {
        checkStatus();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
    };
  }, [invoiceId, currentStatus, intervalMs, checkStatus]);

  return {
    isChecking,
    lastCheckedAt,
    checkNow: checkStatus,
  };
}
