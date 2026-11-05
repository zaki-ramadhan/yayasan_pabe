"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { toast } from "@/hooks/useToast";
import { formatRupiah } from "@/lib/formatters";

/**
 * Hook untuk mendengarkan Server-Sent Events (SSE) live feed dashboard admin.
 * Membuka koneksi real-time untuk mendeteksi donasi baru masuk & aktivitas operasional.
 */
export function useAdminLiveFeed({ enabled = true } = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !enabled) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const es = new EventSource("/api/admin/live-feed");
      eventSourceRef.current = es;

      es.addEventListener("connected", () => {
        setIsConnected(true);
        retryCountRef.current = 0;
      });

      es.addEventListener("DONATION_PAID", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent({ type: "DONATION_PAID", data, timestamp: new Date() });

          const formattedAmount = data.amount ? `Rp${formatRupiah(data.amount)}` : "Donasi";
          toast.success(
            `${data.donorName || "Donatur"} untuk "${data.campaignTitle || "Program Yayasan"}"`,
            {
              title: `Donasi baru: ${formattedAmount}`,
              duration: 6000,
            }
          );
        } catch {}
      });

      es.addEventListener("VOLUNTEER_CHECKIN", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent({ type: "VOLUNTEER_CHECKIN", data, timestamp: new Date() });

          toast.info(
            `Telah hadir pada kegiatan "${data.activity || "Kegiatan"}"`,
            {
              title: `Presensi: ${data.name || "Relawan"}`,
              duration: 5000,
            }
          );
        } catch {}
      });

      es.onerror = () => {
        setIsConnected(false);
        es.close();

        // Exponential backoff reconnect: 3s, 6s, 12s, maks 30s
        const delay = Math.min(3000 * Math.pow(2, retryCountRef.current), 30000);
        retryCountRef.current += 1;

        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          if (typeof document !== "undefined" && document.visibilityState === "visible") {
            connect();
          }
        }, delay);
      };
    } catch {
      setIsConnected(false);
    }
  }, [enabled]);

  useEffect(() => {
    connect();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !isConnected) {
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [connect, isConnected]);

  return {
    isConnected,
    lastEvent,
  };
}
