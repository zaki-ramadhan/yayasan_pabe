"use client";

import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

const MAX_COVER_LETTER_LENGTH = 500;

/**
 * Sub-komponen modular: Surat pengantar & motivasi bergabung pelamar.
 * Dilengkapi batasan maksimal 500 karakter, indikator counter, dan area ketik proporsional.
 * Menerapkan SRP & konsistensi ukuran teks standar (text-sm, font-normal).
 *
 * @param {object} props
 */
export function CareerApplicantProfileFields({
  formData,
  onChange,
  onBlur,
  errors = {},
}) {
  const currentLength = formData?.coverLetter?.length || 0;
  const isBelowMin = currentLength > 0 && currentLength < 10;

  return (
    <FormField
      label="Motivasi bergabung"
      required
      error={errors.coverLetter}
      hint="Ceritakan secara ringkas latar belakang, keahlian, atau niat berkhidmat Anda (min. 10 karakter)."
      action={
        <span
          className={cn(
            "text-xs tabular-nums select-none",
            isBelowMin
              ? "text-amber-600 font-medium"
              : currentLength >= MAX_COVER_LETTER_LENGTH
              ? "text-amber-600 font-medium"
              : "text-slate-500"
          )}
        >
          {currentLength}/{MAX_COVER_LETTER_LENGTH}
          {isBelowMin && (
            <span className="ml-1 text-[11px] font-normal">
              (kurang {10 - currentLength} karakter)
            </span>
          )}
        </span>
      }
    >
      <Textarea
        placeholder="Ceritakan secara ringkas latar belakang, keahlian, atau motivasi Anda bergabung bersama yayasan..."
        value={formData.coverLetter}
        maxLength={MAX_COVER_LETTER_LENGTH}
        onChange={(e) => onChange("coverLetter", e.target.value)}
        onBlur={onBlur ? onBlur("coverLetter") : undefined}
        rows={4}
        required
        className="text-sm font-normal resize-none min-h-[115px] leading-relaxed"
      />
    </FormField>
  );
}
