"use client";

import { useState, useCallback, useMemo } from "react";
import { isFormDirty } from "@/lib/formUtils";

/**
 * Hook terpusat untuk formulir dengan sanitasi karakter real-time,
 * auto-trim saat blur, pembersihan nilai saat submit,
 * serta deteksi perubahan nilai (isDirty / hasChanges) berbasis SSOT.
 */
export function useSanitizedForm(initialValues = {}, fieldSanitizers = {}, validator = null) {
  const [values, setValues] = useState(() => {
    const initialized = {};
    for (const [key, val] of Object.entries(initialValues)) {
      const sanitizer = fieldSanitizers[key];
      initialized[key] = sanitizer && typeof val === "string" ? sanitizer(val) : (val ?? "");
    }
    return initialized;
  });

  // Sinkronisasi otomatis saat initialValues berubah dari luar (pola resmi React tanpa cascading effect)
  const [prevInitial, setPrevInitial] = useState(initialValues);
  if (initialValues !== prevInitial) {
    setPrevInitial(initialValues);
    const initialized = {};
    for (const [key, val] of Object.entries(initialValues || {})) {
      const sanitizer = fieldSanitizers[key];
      initialized[key] = sanitizer && typeof val === "string" ? sanitizer(val) : (val ?? "");
    }
    setValues(initialized);
  }

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

  // SSOT dirty checking: membandingkan values saat ini dengan initialValues
  const isDirty = useMemo(() => {
    return isFormDirty(initialValues, values);
  }, [initialValues, values]);

  // SSOT validasi formulir real-time
  const isValid = useMemo(() => {
    if (!validator) return true;
    const res = validator(values);
    return typeof res === "boolean" ? res : Boolean(res?.isValid);
  }, [validator, values]);

  const resetForm = useCallback(() => {
    const initialized = {};
    for (const [key, val] of Object.entries(initialValues || {})) {
      const sanitizer = fieldSanitizers[key];
      initialized[key] = sanitizer && typeof val === "string" ? sanitizer(val) : (val ?? "");
    }
    setValues(initialized);
  }, [initialValues, fieldSanitizers]);

  return {
    values,
    setValues,
    handleChange,
    handleBlur,
    getCleanValues,
    bind,
    isDirty,
    hasChanges: isDirty,
    isValid,
    isSubmitDisabled: !isValid || !isDirty,
    resetForm,
  };
}
