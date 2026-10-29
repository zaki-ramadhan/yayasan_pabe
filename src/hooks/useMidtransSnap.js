"use client";

import { useEffect, useState, useCallback } from "react";
import { getMidtransClientKey, getMidtransSnapScriptUrl } from "@/lib/midtransConfig";
import { toast } from "@/hooks/useToast";

/**
 * Custom Hook for managing Midtrans Snap Popup Lifecycle
 */
export function useMidtransSnap() {
  const [isReady, setIsReady] = useState(false);
  const [isLoadingScript, setIsLoadingScript] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.snap) {
      setIsReady(true);
      setIsLoadingScript(false);
      return;
    }

    const clientKey = getMidtransClientKey();
    const scriptUrl = getMidtransSnapScriptUrl();
    const scriptId = "midtrans-snap-script";

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener("load", () => {
        setIsReady(true);
        setIsLoadingScript(false);
      });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = scriptUrl;
    script.setAttribute("data-client-key", clientKey);
    script.async = true;

    script.onload = () => {
      setIsReady(true);
      setIsLoadingScript(false);
    };

    script.onerror = () => {
      setIsLoadingScript(false);
      console.error("Gagal memuat script Midtrans Snap SDK.");
    };

    document.body.appendChild(script);

    return () => {
      // Keep script cached in document to avoid repeated network overhead
    };
  }, []);

  const payWithSnap = useCallback(
    (snapToken, callbacks = {}) => {
      if (!snapToken) {
        toast.error("Token pembayaran Midtrans tidak valid.");
        return;
      }

      if (!window.snap) {
        toast.error("Sistem pembayaran sedang memuat. Silakan tunggu sejenak.");
        return;
      }

      window.snap.pay(snapToken, {
        onSuccess: (result) => {
          toast.success("Alhamdulillah, pembayaran donasi berhasil!");
          callbacks.onSuccess?.(result);
        },
        onPending: (result) => {
          toast.info("Menunggu penyelesaian pembayaran donasi.");
          callbacks.onPending?.(result);
        },
        onError: (result) => {
          toast.error("Pembayaran donasi dibatalkan atau gagal diproses.");
          callbacks.onError?.(result);
        },
        onClose: () => {
          callbacks.onClose?.();
        },
      });
    },
    []
  );

  return {
    isReady,
    isLoadingScript,
    payWithSnap,
  };
}
