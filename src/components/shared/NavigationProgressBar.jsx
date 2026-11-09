"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function NavigationProgressBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const barRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const bar = barRef.current;
    const container = containerRef.current;
    if (!bar || !container) return;

    bar.style.transitionDuration = "150ms";
    bar.style.width = "100%";

    const fadeTimer = setTimeout(() => {
      bar.style.opacity = "0";
      const resetTimer = setTimeout(() => {
        container.style.display = "none";
        bar.style.transitionDuration = "0ms";
        bar.style.width = "0%";
        bar.style.opacity = "1";
      }, 200);
      return () => clearTimeout(resetTimer);
    }, 150);

    return () => clearTimeout(fadeTimer);
  }, [pathname, searchParams]);

  useEffect(() => {
    let progressTimer = null;
    let safetyTimer = null;

    const handleAnchorClick = (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = e.target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");

      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target === "_blank" ||
        anchor.hasAttribute("download")
      ) {
        return;
      }

      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;

        const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
        const targetUrl = `${url.pathname}${url.search}${url.hash}`;

        if (currentUrl === targetUrl) return;

        const bar = barRef.current;
        const container = containerRef.current;
        if (!bar || !container) return;

        container.style.display = "block";
        bar.style.transitionDuration = "0ms";
        bar.style.width = "0%";
        bar.style.opacity = "1";

        requestAnimationFrame(() => {
          bar.style.transitionDuration = "300ms";
          bar.style.width = "30%";
        });

        progressTimer = setTimeout(() => {
          bar.style.transitionDuration = "600ms";
          bar.style.width = "75%";
        }, 200);

        safetyTimer = setTimeout(() => {
          if (container) container.style.display = "none";
        }, 8000);
      } catch {
        // Abaikan parse error URL
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      if (progressTimer) clearTimeout(progressTimer);
      if (safetyTimer) clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{ display: "none" }}
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-1 bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 shadow-[0_0_12px_rgba(29,78,216,0.75)] transition-all ease-out"
        style={{ width: "0%", opacity: 1 }}
      />
    </div>
  );
}

export function NavigationProgressBar() {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBarInner />
    </Suspense>
  );
}
