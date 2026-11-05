"use client";

import { useState, useEffect, useCallback } from "react";
import { safeFetch } from "@/lib/safeFetch";
import {
  R2_FREE_TIER_BYTES,
  calculateStorageHealth,
  STORAGE_STATUS,
} from "@/lib/storageConstants";

/**
 * Controller hook untuk memantau status peringatan kapasitas Cloudflare R2.
 * Menyediakan dukungan penolakan (dismiss) per sesi dan override pengujian instan via URL / sessionStorage.
 */
export function useStorageAlert() {
  const [data, setData] = useState({
    isConfigured: true,
    totalBytes: 0,
    limitBytes: R2_FREE_TIER_BYTES,
    totalCount: 0,
    health: calculateStorageHealth(0, R2_FREE_TIER_BYTES),
  });
  const [isLoading, setIsLoading] = useState(true);

  const [dismissedStatus, setDismissedStatus] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return sessionStorage.getItem("pabe_storage_alert_dismissed") || "";
      } catch {
        return "";
      }
    }
    return "";
  });

  const healthStatus = data.health?.status;
  const isDismissed = Boolean(healthStatus && dismissedStatus === healthStatus);

  const fetchAlerts = useCallback(async () => {
    setIsLoading(true);
    // 1. Cek parameter pengujian instan di URL atau sessionStorage (?mockStorage=85 atau ?mockStorage=96)
    if (typeof window !== "undefined") {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryMock = urlParams.get("mockStorage");
        const sessionMock = sessionStorage.getItem("pabe_mock_storage");
        const activeMock = queryMock || sessionMock;

        if (activeMock !== null && !isNaN(Number(activeMock))) {
          const mockPercent = Number(activeMock);
          const simulatedBytes = Math.round((mockPercent / 100) * R2_FREE_TIER_BYTES);
          const simulatedHealth = calculateStorageHealth(simulatedBytes, R2_FREE_TIER_BYTES);

          setData({
            isConfigured: true,
            totalBytes: simulatedBytes,
            limitBytes: R2_FREE_TIER_BYTES,
            totalCount: 120,
            health: simulatedHealth,
          });
          setIsLoading(false);
          return;
        }
      } catch {
        // Lanjutkan pengambilan normal jika parsing query gagal
      }
    }

    try {
      const res = await safeFetch("/api/admin/storage/alerts", {}, 5000);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data);
        }
      }
    } catch (err) {
      console.warn("Gagal mengambil status peringatan penyimpanan:", err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      // 1. Cek parameter pengujian instan di URL atau sessionStorage
      if (typeof window !== "undefined") {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const queryMock = urlParams.get("mockStorage");
          const sessionMock = sessionStorage.getItem("pabe_mock_storage");
          const activeMock = queryMock || sessionMock;

          if (activeMock !== null && !isNaN(Number(activeMock))) {
            const mockPercent = Number(activeMock);
            const simulatedBytes = Math.round((mockPercent / 100) * R2_FREE_TIER_BYTES);
            const simulatedHealth = calculateStorageHealth(simulatedBytes, R2_FREE_TIER_BYTES);

            if (!ignore) {
              setData({
                isConfigured: true,
                totalBytes: simulatedBytes,
                limitBytes: R2_FREE_TIER_BYTES,
                totalCount: 120,
                health: simulatedHealth,
              });
              setIsLoading(false);
            }
            return;
          }
        } catch {}
      }

      try {
        const res = await safeFetch("/api/admin/storage/alerts", {}, 5000);
        if (res.ok) {
          const json = await res.json();
          if (!ignore && json.success && json.data) {
            setData(json.data);
          }
        }
      } catch (err) {
        if (!ignore) console.warn("Gagal mengambil status peringatan penyimpanan:", err.message);
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const dismissAlert = useCallback(() => {
    if (typeof window !== "undefined" && healthStatus) {
      try {
        sessionStorage.setItem("pabe_storage_alert_dismissed", healthStatus);
      } catch {}
      setDismissedStatus(healthStatus);
    }
  }, [healthStatus]);

  return {
    ...data,
    isLoading,
    isDismissed,
    dismissAlert,
    refreshAlerts: fetchAlerts,
    isStorageFull: healthStatus === STORAGE_STATUS.CRITICAL,
  };
}
