"use client";

import { useEffect, useState, useCallback } from "react";
import { getMidtransClientKey, getMidtransSnapScriptUrl } from "@/lib/midtransConfig";
import { toast } from "@/hooks/useToast";

/**
 * Custom Hook for managing Midtrans Snap Popup Lifecycle
 * Fully compliant with React 19 / Compiler effect rules (Zero synchronous cascading setState).
 */
export function useMidtransSnap() {
  const [isReady, setIsReady] = useState(() => {
    return typeof window !== "undefined" && Boolean(window.snap);
  });
  const [isLoadingScript, setIsLoadingScript] = useState(() => {
    return typeof window !== "undefined" ? !Boolean(window.snap) : true;
  });

  useEffect(() => {
    if (typeof window === "undefined" || window.snap) {
      return;
    }

    const clientKey = getMidtransClientKey();
    const scriptUrl = getMidtransSnapScriptUrl();
    const scriptId = "midtrans-snap-script";

    const handleLoaded = () => {
      setIsReady(true);
      setIsLoadingScript(false);
    };

    const handleError = () => {
      setIsLoadingScript(false);
      console.error("Gagal memuat script Midtrans Snap SDK.");
    };

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener("load", handleLoaded, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = scriptUrl;
    if (clientKey) {
      script.setAttribute("data-client-key", clientKey);
    }
    script.async = true;

    script.addEventListener("load", handleLoaded, { once: true });
    script.addEventListener("error", handleError, { once: true });

    document.body.appendChild(script);
  }, []);

  const payWithSnap = useCallback(
    (snapToken, callbacks = {}) => {
      if (!snapToken) {
        toast.error("Token pembayaran Midtrans tidak valid.");
        return;
      }

      if (typeof window === "undefined" || !window.snap) {
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
