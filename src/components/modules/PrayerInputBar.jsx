"use client";

import { useState, useRef, useEffect } from "react";
import { SendHorizonal, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRAYER_LIMITS, countGraphemes, hasMeaningfulText } from "@/lib/security";

export function PrayerInputBar({
  onSend,
  className,
  minLength = PRAYER_LIMITS.MIN_LENGTH,
  maxLength = PRAYER_LIMITS.MAX_LENGTH,
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const textareaRef = useRef(null);

  const trimmed = text.trim();
  // Hitung jumlah karakter visual asli (1 emoji majemuk / bertanda = 1 karakter)
  const charCount = countGraphemes(text);
  const trimmedLength = countGraphemes(trimmed);
  const hasWords = hasMeaningfulText(trimmed);

  const isTooShort = trimmedLength > 0 && trimmedLength < minLength;
  const isOnlyEmojis = trimmedLength >= minLength && !hasWords;
  const isNearMax = charCount >= maxLength - 25; // Muncul saat mendekati batas maksimal (sisa 25 karakter)
  const isValid = trimmedLength >= minLength && charCount <= maxLength && hasWords;

  // Auto-resize textarea mengikuti penambahan baris teks secara natural tanpa batasan tinggi kaku
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const scrollH = el.scrollHeight;
    el.style.height = `${scrollH}px`;
    // Mendeteksi apakah teks sudah menjadi lebih dari satu baris
    setIsMultiLine(scrollH > 28 || text.includes("\n"));
  }, [text]);

  const handleSend = async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      // Jeda ~450ms untuk feedback visual spinner & mencegah spam double-submit
      await new Promise((resolve) => setTimeout(resolve, 450));
      await onSend?.(trimmed);
      setText("");
      setIsMultiLine(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    // Enter tanpa Shift = Kirim pesan
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Shift + Enter = Baris baru
  };

  return (
    <div className={cn("flex items-end gap-2 w-full", className)}>
      {/* Container Input: rounded-full jika masih 1 baris, rounded-2xl jika sudah lebih dari 1 baris */}
      <div
        className={cn(
          "flex-1 flex flex-col bg-white border border-slate-400 focus-within:border-primary transition-all duration-150 shadow-2xs",
          isMultiLine ? "rounded-2xl px-3.5 pt-2 pb-1.5" : "rounded-full px-4 py-2",
          isSubmitting && "bg-slate-50 opacity-80"
        )}
      >
        <div className="flex items-center w-full gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            disabled={isSubmitting}
            value={text}
            onChange={(e) => setText(e.target.value.replace(/^\s+/, "").replace(/\s{2,}/g, " "))}
            onBlur={() => setText((prev) => prev.trim())}
            onKeyDown={handleKeyDown}
            placeholder={isSubmitting ? "Sedang memproses doa..." : "Tulis doa kebaikan Anda..."}
            maxLength={maxLength}
            autoComplete="off"
            className="w-full bg-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed overflow-hidden p-0 disabled:cursor-not-allowed"
          />

          {/* Indikator saat 1 baris (inline) */}
          {!isMultiLine && isTooShort && (
            <span className="text-[11px] text-amber-600 font-medium select-none shrink-0">
              min. {minLength}
            </span>
          )}
          {!isMultiLine && isOnlyEmojis && (
            <span className="text-[11px] text-amber-600 font-medium select-none shrink-0">
              sertakan kata doa
            </span>
          )}
        </div>

        {/* Posisi teks keterangan x/y di pojok kanan bawah seperti waktu/timestamp bubble chat */}
        {(isNearMax || isOnlyEmojis || (isMultiLine && isTooShort)) && (
          <div className="flex items-center justify-end gap-1.5 mt-0.5 select-none leading-none">
            {isMultiLine && isTooShort && (
              <span className="text-[10px] sm:text-[11px] text-amber-600 font-medium">
                min. {minLength} karakter
              </span>
            )}
            {isMultiLine && isOnlyEmojis && (
              <span className="text-[10px] sm:text-[11px] text-amber-600 font-medium">
                sertakan kalimat doa
              </span>
            )}
            {isNearMax && (
              <span
                className={cn(
                  "text-[10px] sm:text-[11px] tabular-nums font-normal",
                  charCount >= maxLength
                    ? "text-rose-600 font-semibold"
                    : "text-slate-400"
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={!isValid || isSubmitting}
        aria-label="Kirim doa"
        className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed disabled:pointer-events-none bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:shadow-none mb-0.5"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <SendHorizonal className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
