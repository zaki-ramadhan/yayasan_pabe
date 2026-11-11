"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import { CLOUDFLARE_TEST_SITE_KEY } from "@/lib/turnstile";
import { cn } from "@/lib/utils";

const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * Reusable Cloudflare Turnstile Widget Component.
 * Pola inisialisasi presisi identik dengan standar produksi (SumoPod).
 */
export const TurnstileWidget = forwardRef(function TurnstileWidget(
  {
    onSuccess,
    onError,
    onExpire,
    action = "login",
    theme = "light",
    size = "flexible",
    className,
    siteKey,
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);

  // Simpan callback dalam ref agar useEffect render tidak restart setiap kali fungsi parent berubah
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const [activeSiteKey, setActiveSiteKey] = useState(
    siteKey ||
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    CLOUDFLARE_TEST_SITE_KEY
  );

  useEffect(() => {
    if (siteKey && siteKey !== CLOUDFLARE_TEST_SITE_KEY) {
      setActiveSiteKey(siteKey);
      return;
    }

    // Fallback runtime query jika siteKey belum diinjeksi saat build
    fetch("/api/auth/turnstile-config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.siteKey && data.siteKey !== CLOUDFLARE_TEST_SITE_KEY) {
          setActiveSiteKey(data.siteKey);
        }
      })
      .catch(() => {});
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current !== null && window?.turnstile) {
        setIsWidgetLoaded(false);
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
          // ignore
        }
      }
    },
    remove: () => {
      if (widgetIdRef.current !== null && window?.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // ignore
        }
      }
    },
  }));

  // Pastikan skrip resmi Cloudflare Turnstile disuntikkan ke dokumen
  useEffect(() => {
    if (typeof window === "undefined") return;

    let script = document.querySelector(`script[src="${TURNSTILE_SCRIPT_URL}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  // Lifecycle render Turnstile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const renderWidget = () => {
      if (!containerRef.current || !window?.turnstile) return;

      try {
        containerRef.current.innerHTML = "";
        if (widgetIdRef.current !== null) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: activeSiteKey,
          action,
          theme,
          size,
          callback: (token) => {
            setIsWidgetLoaded(true);
            onSuccessRef.current?.(token);
          },
          "error-callback": (err) => {
            console.warn("[Turnstile] Error callback:", err);
            onErrorRef.current?.(err);
          },
          "expired-callback": () => {
            setIsWidgetLoaded(false);
            onExpireRef.current?.();
          },
        });

        // Tampilkan widget setelah inisialisasi iframe berhasil
        setTimeout(() => {
          setIsWidgetLoaded(true);
        }, 800);
      } catch (err) {
        console.warn("[Turnstile] Render error:", err.message);
        onErrorRef.current?.(err);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 100);

      const timeout = setTimeout(() => {
        clearInterval(interval);
        if (!window.turnstile) {
          onErrorRef.current?.("TURNSTILE_SCRIPT_TIMEOUT");
        }
      }, 10000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }

    return () => {
      if (widgetIdRef.current !== null && window?.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch {
          // ignore
        }
      }
    };
  }, [activeSiteKey, action, theme, size]);

  return (
    <div
      className={cn(
        "turnstile-wrapper my-1.5 relative w-full block min-h-[65px]",
        className
      )}
    >
      {/* Skeleton Shimmer Placeholder saat widget sedang memuat (seperti SumoPod) */}
      {!isWidgetLoaded && (
        <div className="absolute inset-0 z-10 bg-[#f9f9f9] border border-[#d9d9d9] rounded flex items-center px-4 gap-3 overflow-hidden shadow-xs w-full">
          <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0 animate-pulse" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-28 animate-pulse" />
            <div className="h-2 bg-slate-200 rounded w-16 animate-pulse" />
          </div>
          <div className="shrink-0 flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded bg-slate-200 animate-pulse" />
            <div className="h-1.5 bg-slate-200 rounded w-10 animate-pulse" />
          </div>
        </div>
      )}

      {/* Target Mount Container Turnstile */}
      <div
        ref={containerRef}
        className="w-full block min-h-[65px] [&_div]:!w-full [&_iframe]:!w-full [&_iframe]:!min-w-full"
        style={{ width: "100%", minHeight: "65px" }}
      />
    </div>
  );
});
