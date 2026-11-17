"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { safeFetch } from "@/lib/safeFetch";
import { calculateProgress } from "@/lib/formatters";

/**
 * Menghitung metrik turunan kampanye secara deterministik.
 */
export function calculateLiveCampaignMetrics({ collectedAmount, targetAmount, donorCount }) {
  const newCollected = Number(collectedAmount ?? 0);
  const newTarget = Number(targetAmount ?? 0);
  const newDonorCount = Number(donorCount ?? 0);
  const newProgress = calculateProgress(newCollected, newTarget);
  return {
    collectedAmount: newCollected,
    targetAmount: newTarget,
    donorCount: newDonorCount,
    progress: newProgress,
  };
}

/**
 * Hook untuk sinkronisasi metrik donasi program (collectedAmount, donorCount, progress)
 * secara real-time adaptif saat donatur kembali ke tab setelah membayar di tab lain.
 *
 * @param {object} params
 * @param {string} params.slug - Campaign slug
 * @param {number} [params.initialCollectedAmount=0]
 * @param {number} [params.initialTargetAmount=0]
 * @param {number} [params.initialDonorCount=0]
 * @param {number} [params.initialProgress=0]
 * @param {number} [params.pollingIntervalMs=25000] - Interval revalidasi pasif saat tab aktif
 */
export function useCampaignLiveStats({
  slug,
  initialCollectedAmount = 0,
  initialTargetAmount = 0,
  initialDonorCount = 0,
  initialProgress = 0,
  pollingIntervalMs = 25000,
}) {
  const [stats, setStats] = useState({
    collectedAmount: Number(initialCollectedAmount) || 0,
    targetAmount: Number(initialTargetAmount) || 0,
    donorCount: Number(initialDonorCount) || 0,
    progress: Number(initialProgress) || 0,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const isMountedRef = useRef(true);
  const lastFetchedAtRef = useRef(0);

  const fetchLiveStats = useCallback(async () => {
    if (!slug || typeof window === "undefined") return;

    try {
      setIsUpdating(true);
      const res = await safeFetch(
        `/api/donations?campaignSlug=${encodeURIComponent(slug)}&limit=1`,
        { cache: "no-store" },
        8000
      );

      if (!res.ok) return;
      const json = await res.json();

      if (!isMountedRef.current || !json?.success || !json?.data) return;

      const { collectedAmount, targetAmount, donorCount } = json.data;
      const nextMetrics = calculateLiveCampaignMetrics({ collectedAmount, targetAmount, donorCount });

      setStats((prev) => {
        if (
          prev.collectedAmount === nextMetrics.collectedAmount &&
          prev.donorCount === nextMetrics.donorCount &&
          prev.progress === nextMetrics.progress
        ) {
          return prev;
        }
        return nextMetrics;
      });

      lastFetchedAtRef.current = Date.now();
    } catch {
    } finally {
      if (isMountedRef.current) {
        setIsUpdating(false);
      }
    }
  }, [slug]);

  useEffect(() => {
    isMountedRef.current = true;
    lastFetchedAtRef.current = Date.now();

    const handleFocusOrVisible = () => {
      if (document.visibilityState === "visible") {
        const timeSinceLastFetch = Date.now() - lastFetchedAtRef.current;
        if (timeSinceLastFetch > 3000) {
          fetchLiveStats();
        }
      }
    };

    window.addEventListener("focus", handleFocusOrVisible);
    document.addEventListener("visibilitychange", handleFocusOrVisible);

    const intervalId = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLiveStats();
      }
    }, pollingIntervalMs);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("focus", handleFocusOrVisible);
      document.removeEventListener("visibilitychange", handleFocusOrVisible);
      clearInterval(intervalId);
    };
  }, [fetchLiveStats, pollingIntervalMs]);

  return {
    collectedAmount: stats.collectedAmount,
    targetAmount: stats.targetAmount,
    donorCount: stats.donorCount,
    progress: stats.progress,
    isUpdating,
    refreshStats: fetchLiveStats,
  };
}

