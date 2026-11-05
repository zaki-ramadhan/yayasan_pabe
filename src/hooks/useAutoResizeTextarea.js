"use client";

import { useLayoutEffect, useEffect, useRef, useCallback } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useAutoResizeTextarea({
  ref,
  value,
  minRows = 3,
  maxRows = 10,
  onResize,
}) {
  const internalRef = useRef(null);
  const targetRef = ref || internalRef;

  const adjustHeight = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;

    const computed = window.getComputedStyle(el);
    const fontSize = parseFloat(computed.fontSize) || 14;
    const rawLineHeight = parseFloat(computed.lineHeight);
    const lineHeight = isNaN(rawLineHeight) ? fontSize * 1.5 : rawLineHeight;

    const paddingTop = parseFloat(computed.paddingTop) || 0;
    const paddingBottom = parseFloat(computed.paddingBottom) || 0;
    const paddingVertical = paddingTop + paddingBottom;

    const isBorderBox = computed.boxSizing === "border-box";
    const borderTop = parseFloat(computed.borderTopWidth) || 0;
    const borderBottom = parseFloat(computed.borderBottomWidth) || 0;
    const borderVertical = isBorderBox ? borderTop + borderBottom : 0;

    const minHeight = Math.ceil(minRows * lineHeight + paddingVertical + borderVertical);
    const maxHeight = maxRows
      ? Math.ceil(maxRows * lineHeight + paddingVertical + borderVertical)
      : Infinity;

    el.style.height = "auto";

    const contentHeight = el.scrollHeight + borderVertical;
    const targetHeight = Math.max(minHeight, Math.min(contentHeight, maxHeight));

    el.style.height = `${targetHeight}px`;
    el.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";

    if (onResize) {
      onResize({
        height: targetHeight,
        isScrollable: contentHeight > maxHeight,
        scrollHeight: contentHeight,
      });
    }
  }, [minRows, maxRows, targetRef, onResize]);

  useIsomorphicLayoutEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    const handleInput = () => adjustHeight();
    el.addEventListener("input", handleInput);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => adjustHeight());
      resizeObserver.observe(el);
    }

    return () => {
      el.removeEventListener("input", handleInput);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [adjustHeight, targetRef]);

  return {
    ref: targetRef,
    adjustHeight,
  };
}
