"use client";

import { useState, useCallback } from "react";

/**
 * Hook terpusat untuk formulir dengan sanitasi karakter real-time,
 * auto-trim saat blur, dan pembersihan nilai saat submit.
 */
export function useSanitizedForm(initialValues = {}, fieldSanitizers = {}) {
  const [values, setValues] = useState(() => {
    const initialized = {};
    for (const [key, val] of Object.entries(initialValues)) {
      const sanitizer = fieldSanitizers[key];
      initialized[key] = sanitizer && typeof val === "string" ? sanitizer(val) : (val ?? "");
    }
    return initialized;
  });

  const handleChange = useCallback(
    (field, sanitizer) => (e) => {
      const rawVal = e && e.target !== undefined ? e.target.value : e;
      const cleanVal = sanitizer ? sanitizer(rawVal) : rawVal;
      setValues((prev) => ({ ...prev, [field]: cleanVal }));
    },
    []
  );

  const handleBlur = useCallback(
    (field) => () => {
      setValues((prev) => {
        const current = prev[field];
        if (typeof current !== "string") return prev;
        const trimmed = current.trim();
        if (trimmed === current) return prev;
        return { ...prev, [field]: trimmed };
      });
    },
    []
  );

  const getCleanValues = useCallback(() => {
    const clean = {};
    for (const [key, val] of Object.entries(values)) {
      if (typeof val === "string") {
        const sanitizer = fieldSanitizers[key];
        const sanitized = sanitizer ? sanitizer(val) : val;
        clean[key] = sanitized.trim();
      } else {
        clean[key] = val;
      }
    }
    return clean;
  }, [values, fieldSanitizers]);

  const bind = useCallback(
    (field, customSanitizer) => {
      const sanitizer = customSanitizer || fieldSanitizers[field];
      return {
        value: values[field] ?? "",
        onChange: handleChange(field, sanitizer),
        onBlur: handleBlur(field),
      };
    },
    [values, fieldSanitizers, handleChange, handleBlur]
  );

  return {
    values,
    setValues,
    handleChange,
    handleBlur,
    getCleanValues,
    bind,
  };
}
