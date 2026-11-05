/* eslint-disable react-hooks/set-state-in-effect */
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
  const connectRef = useRef(null);

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

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("pabe:admin-live-event", {
                detail: { type: "DONATION_PAID", data, timestamp: new Date() },
              })
            );
          }
        } catch {}
      });

      es.addEventListener("DONATION_UPDATED", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent({ type: "DONATION_UPDATED", data, timestamp: new Date() });

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("pabe:admin-live-event", {
                detail: { type: "DONATION_UPDATED", data, timestamp: new Date() },
              })
            );
          }
        } catch {}
      });

      es.addEventListener("VOLUNTEER_CHECKIN", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent({ type: "VOLUNTEER_CHECKIN", data, timestamp: new Date() });

          toast.info(
            `Telah mendaftar dari "${data.city || "Kota Domisili"}"`,
            {
              title: `Relawan Baru: ${data.name || "Relawan"}`,
              duration: 5000,
            }
          );

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("pabe:admin-live-event", {
                detail: { type: "VOLUNTEER_CHECKIN", data, timestamp: new Date() },
              })
            );
          }
        } catch {}
      });

      es.addEventListener("DISTRIBUTION_CREATED", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent({ type: "DISTRIBUTION_CREATED", data, timestamp: new Date() });

          const formattedAmount = data.disbursedAmount ? `Rp${formatRupiah(data.disbursedAmount)}` : "";
          toast.success(
            `${formattedAmount ? `${formattedAmount} - ` : ""}${data.title || "Penyaluran"} (${data.campaignTitle || "Program"})`,
            {
              title: "Penyaluran Baru Tercatat",
              duration: 5000,
            }
          );

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("pabe:admin-live-event", {
                detail: { type: "DISTRIBUTION_CREATED", data, timestamp: new Date() },
              })
            );
          }
        } catch {}
      });

      es.addEventListener("CAREER_APPLICATION", (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastEvent({ type: "CAREER_APPLICATION", data, timestamp: new Date() });

          toast.info(
            `${data.fullName || "Pelamar"} melamar posisi "${data.position || "Lowongan"}"`,
            {
              title: "Lamaran Kerja Baru",
              duration: 5000,
            }
          );

          if (typeof window !== "undefined") {
            window.dispatchEvent(
              new CustomEvent("pabe:admin-live-event", {
                detail: { type: "CAREER_APPLICATION", data, timestamp: new Date() },
              })
            );
          }
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
            connectRef.current?.();
          }
        }, delay);
      };
    } catch {
      setIsConnected(false);
    }
  }, [enabled]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

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

/**
 * Hook untuk berlangganan event live admin tertentu dari bus internal.
 * Memungkinkan komponen UI bereaksi tanpa membuka koneksi SSE baru.
 *
 * @param {string} [targetType] - Tipe event (misal: 'DONATION_PAID', 'VOLUNTEER_CHECKIN') atau null untuk semua
 * @param {(event: { type: string, data: any, timestamp: Date }) => void} callback
 */
export function useAdminLiveEvent(targetType, callback) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e) => {
      if (!targetType || e.detail?.type === targetType) {
        savedCallback.current?.(e.detail);
      }
    };

    window.addEventListener("pabe:admin-live-event", handler);
    return () => {
      window.removeEventListener("pabe:admin-live-event", handler);
    };
  }, [targetType]);
}
