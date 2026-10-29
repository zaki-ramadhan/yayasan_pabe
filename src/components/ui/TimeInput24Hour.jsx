"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormField } from "@/components/ui/FormField";

/**
 * Controlled 24-Hour Numeric Time Input (HH:MM)
 * Strict validation: 00-23 hours, 00-59 minutes, auto-pad with leading zero, keyboard step, and paste handler.
 */
export function TimeInput24Hour({ value = "05:00", onChange, error, isInvalid }) {
  const formContext = useFormField();
  const hasError =
    isInvalid !== undefined
      ? Boolean(isInvalid)
      : error !== undefined
      ? Boolean(error)
      : formContext?.isInvalid || false;

  const [initH = "05", initM = "00"] = (value || "05:00").split(":");
  const [prevValue, setPrevValue] = React.useState(value);
  const [hour, setHour] = React.useState(initH);
  const [minute, setMinute] = React.useState(initM);

  const hourRef = React.useRef(null);
  const minuteRef = React.useRef(null);

  if (prevValue !== value) {
    setPrevValue(value);
    setHour(initH);
    setMinute(initM);
  }

  const handleHourChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setHour("");
      return;
    }
    let num = parseInt(raw, 10);
    if (num > 23) {
      num = 23;
    }
    const val = raw.length > 2 ? String(num).slice(-2) : String(num);
    setHour(val);

    if (val.length === 2) {
      const padH = val.padStart(2, "0");
      const padM = (minute || "00").padStart(2, "0");
      onChange(`${padH}:${padM}`);
    }
  };

  const handleHourBlur = () => {
    let finalH = "05";
    if (hour !== "") {
      let num = parseInt(hour, 10) || 0;
      num = Math.max(0, Math.min(23, num));
      finalH = String(num).padStart(2, "0");
    }
    setHour(finalH);
    const padM = (minute || "00").padStart(2, "0");
    onChange(`${finalH}:${padM}`);
  };

  const handleHourKeyDown = (e) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const cur = parseInt(hour, 10) || 0;
      const next = (cur + 1) % 24;
      const nextStr = String(next).padStart(2, "0");
      setHour(nextStr);
      onChange(`${nextStr}:${(minute || "00").padStart(2, "0")}`);
      requestAnimationFrame(() => hourRef.current?.select());
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const cur = parseInt(hour, 10) || 0;
      const next = cur === 0 ? 23 : cur - 1;
      const nextStr = String(next).padStart(2, "0");
      setHour(nextStr);
      onChange(`${nextStr}:${(minute || "00").padStart(2, "0")}`);
      requestAnimationFrame(() => hourRef.current?.select());
      return;
    }

    if (e.key === ":" || e.key === "ArrowRight") {
      e.preventDefault();
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const handleMinuteChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw === "") {
      setMinute("");
      return;
    }
    let num = parseInt(raw, 10);
    if (num > 59) {
      num = 59;
    }
    const val = raw.length > 2 ? String(num).slice(-2) : String(num);
    setMinute(val);

    if (val.length === 2) {
      const padH = (hour || "05").padStart(2, "0");
      const padM = val.padStart(2, "0");
      onChange(`${padH}:${padM}`);
    }
  };

  const handleMinuteBlur = () => {
    let finalM = "00";
    if (minute !== "") {
      let num = parseInt(minute, 10) || 0;
      num = Math.max(0, Math.min(59, num));
      finalM = String(num).padStart(2, "0");
    }
    setMinute(finalM);
    const padH = (hour || "05").padStart(2, "0");
    onChange(`${padH}:${finalM}`);
  };

  const handleMinuteKeyDown = (e) => {
    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
      e.preventDefault();
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      const cur = parseInt(minute, 10) || 0;
      const step = e.shiftKey ? 5 : 1;
      const next = (cur + step) % 60;
      const nextStr = String(next).padStart(2, "0");
      setMinute(nextStr);
      onChange(`${(hour || "05").padStart(2, "0")}:${nextStr}`);
      requestAnimationFrame(() => minuteRef.current?.select());
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      const cur = parseInt(minute, 10) || 0;
      const step = e.shiftKey ? 5 : 1;
      const next = cur - step < 0 ? 60 + (cur - step) : cur - step;
      const nextStr = String(next).padStart(2, "0");
      setMinute(nextStr);
      onChange(`${(hour || "05").padStart(2, "0")}:${nextStr}`);
      requestAnimationFrame(() => minuteRef.current?.select());
      return;
    }

    if (e.key === "ArrowLeft" || (e.key === "Backspace" && minute === "")) {
      e.preventDefault();
      hourRef.current?.focus();
      hourRef.current?.select();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text") || "";
    const clean = pasted.replace(/[^\d:]/g, "");
    if (clean.includes(":")) {
      const [h, m] = clean.split(":");
      const cleanH = String(Math.max(0, Math.min(23, parseInt(h, 10) || 0))).padStart(2, "0");
      const cleanM = String(Math.max(0, Math.min(59, parseInt(m, 10) || 0))).padStart(2, "0");
      setHour(cleanH);
      setMinute(cleanM);
      onChange(`${cleanH}:${cleanM}`);
    } else if (clean.length >= 4) {
      const h = clean.slice(0, 2);
      const m = clean.slice(2, 4);
      const cleanH = String(Math.max(0, Math.min(23, parseInt(h, 10) || 0))).padStart(2, "0");
      const cleanM = String(Math.max(0, Math.min(59, parseInt(m, 10) || 0))).padStart(2, "0");
      setHour(cleanH);
      setMinute(cleanM);
      onChange(`${cleanH}:${cleanM}`);
    } else if (clean.length > 0) {
      const num = Math.max(0, Math.min(23, parseInt(clean, 10) || 0));
      const cleanH = String(num).padStart(2, "0");
      setHour(cleanH);
      onChange(`${cleanH}:${(minute || "00").padStart(2, "0")}`);
      minuteRef.current?.focus();
      minuteRef.current?.select();
    }
  };

  const inputClass = cn(
    "w-16 h-11 text-center font-semibold text-base sm:text-lg rounded-lg focus:outline-none transition-all tracking-wider shadow-2xs",
    hasError
      ? "border border-rose-500 bg-rose-50/15 text-rose-950 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
      : "bg-white border border-slate-300 text-slate-900 focus:ring-1 focus:ring-primary focus:border-primary"
  );

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          ref={hourRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          placeholder="05"
          aria-label="Jam pengingat (00-23)"
          aria-invalid={hasError ? "true" : undefined}
          value={hour}
          onChange={handleHourChange}
          onBlur={handleHourBlur}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.target.select()}
          onKeyDown={handleHourKeyDown}
          onPaste={handlePaste}
          className={inputClass}
        />
        <span className="sr-only">Jam</span>
      </div>

      <span className={cn("text-xl font-bold select-none pb-0.5", hasError ? "text-rose-400" : "text-slate-400")}>:</span>

      <div className="relative">
        <input
          ref={minuteRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={2}
          placeholder="00"
          aria-label="Menit pengingat (00-59)"
          aria-invalid={hasError ? "true" : undefined}
          value={minute}
          onChange={handleMinuteChange}
          onBlur={handleMinuteBlur}
          onFocus={(e) => e.target.select()}
          onClick={(e) => e.target.select()}
          onKeyDown={handleMinuteKeyDown}
          onPaste={handlePaste}
          className={inputClass}
        />
        <span className="sr-only">Menit</span>
      </div>

      <span className="text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-2.5 rounded-lg border border-slate-200 select-none">
        WIB
      </span>
    </div>
  );
}
