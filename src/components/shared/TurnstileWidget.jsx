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
    appearance,
    invisible = false,
    className,
    siteKey,
  },
  ref
) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);

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

    if (
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY !== CLOUDFLARE_TEST_SITE_KEY
    ) {
      return;
    }

    let isMounted = true;
    fetch("/api/auth/turnstile-config")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.siteKey && data.siteKey !== CLOUDFLARE_TEST_SITE_KEY) {
          setActiveSiteKey(data.siteKey);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (
        widgetIdRef.current !== null &&
        window?.turnstile &&
        containerRef.current?.isConnected
      ) {
        setIsWidgetLoaded(false);
        try {
          window.turnstile.reset(widgetIdRef.current);
        } catch {
        }
      }
    },
    remove: () => {
      if (widgetIdRef.current !== null && window?.turnstile) {
        const currentId = widgetIdRef.current;
        widgetIdRef.current = null;
        try {
          if (containerRef.current?.isConnected) {
            window.turnstile.remove(currentId);
          }
        } catch {
        }
      }
    },
  }));

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    let isCancelled = false;
    let loadedTimer = null;

    const cleanupWidget = () => {
      if (loadedTimer) {
        clearTimeout(loadedTimer);
        loadedTimer = null;
      }
      if (widgetIdRef.current !== null && window?.turnstile) {
        const currentId = widgetIdRef.current;
        widgetIdRef.current = null;
        try {
          window.turnstile.remove(currentId);
        } catch {
        }
      }
    };

    const renderWidget = () => {
      if (isCancelled || !containerRef.current || !window?.turnstile) return;

      try {
        cleanupWidget();
        containerRef.current.innerHTML = "";

        const effectiveAppearance = appearance || (invisible ? "interaction-only" : "always");
        const effectiveSize = invisible ? "invisible" : size;

        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: activeSiteKey,
          action,
          theme,
          size: effectiveSize,
          appearance: effectiveAppearance,
          callback: (token) => {
            if (isCancelled) return;
            setIsWidgetLoaded(true);
            onSuccessRef.current?.(token);
          },
          "error-callback": (err) => {
            if (isCancelled) return;
            console.warn("[Turnstile] Error callback:", err);
            onErrorRef.current?.(err);
          },
          "expired-callback": () => {
            if (isCancelled) return;
            setIsWidgetLoaded(false);
            onExpireRef.current?.();
          },
        });

        loadedTimer = setTimeout(() => {
          if (!isCancelled) {
            setIsWidgetLoaded(true);
          }
        }, 800);
      } catch (err) {
        console.warn("[Turnstile] Render error:", err.message);
        onErrorRef.current?.(err);
      }
    };

    let interval = null;
    let timeout = null;

    if (window.turnstile) {
      renderWidget();
    } else {
      interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          interval = null;
          renderWidget();
        }
      }, 100);

      timeout = setTimeout(() => {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
        if (!window.turnstile && !isCancelled) {
          onErrorRef.current?.("TURNSTILE_SCRIPT_TIMEOUT");
        }
      }, 10000);
    }

    return () => {
      isCancelled = true;
      if (interval) clearInterval(interval);
      if (timeout) clearTimeout(timeout);
      cleanupWidget();
    };
  }, [activeSiteKey, action, theme, size, appearance, invisible]);

  if (invisible) {
    return (
      <div
        className={cn(
          "w-0 h-0 opacity-0 overflow-hidden pointer-events-none absolute",
          className
        )}
        aria-hidden="true"
      >
        <div ref={containerRef} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "turnstile-wrapper mt-1 mb-0 relative w-full block min-h-[65px]",
        className
      )}
    >
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

      <div
        ref={containerRef}
        className="w-full block min-h-[65px] [&_div]:!w-full [&_iframe]:!w-full [&_iframe]:!min-w-full"
        style={{ width: "100%", minHeight: "65px" }}
      />
    </div>
  );
});
