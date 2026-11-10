"use client";

import { AutoResizeTextarea } from "@/components/ui/AutoResizeTextarea";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

const MAX_COVER_LETTER_LENGTH = FIELD_LIMITS.CAREER_MOTIVATION.max;
const MIN_COVER_LETTER_LENGTH = FIELD_LIMITS.CAREER_MOTIVATION.min;

export function CareerApplicantProfileFields({
  formData,
  onChange,
  onBlur,
  errors = {},
}) {
  const currentLength = formData?.coverLetter?.length || 0;
  const isBelowMin = currentLength > 0 && currentLength < MIN_COVER_LETTER_LENGTH;

  return (
    <FormField
      label="Motivasi bergabung"
      required
      error={errors.coverLetter}
      hint={`Ceritakan secara ringkas latar belakang, keahlian, atau niat berkhidmat Anda (min. ${MIN_COVER_LETTER_LENGTH} karakter).`}
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
            <span className="ml-1 text-sm font-normal">
              (kurang {MIN_COVER_LETTER_LENGTH - currentLength} karakter)
            </span>
          )}
        </span>
      }
    >
      <AutoResizeTextarea
        placeholder="Ceritakan secara ringkas latar belakang, keahlian, atau motivasi Anda bergabung bersama yayasan..."
        value={formData.coverLetter}
        minLength={MIN_COVER_LETTER_LENGTH}
        maxLength={MAX_COVER_LETTER_LENGTH}
        onChange={(e) => onChange("coverLetter", e.target.value)}
        onBlur={onBlur ? onBlur("coverLetter") : undefined}
        minRows={4}
        maxRows={10}
        required
        className="text-sm font-normal leading-relaxed"
      />
    </FormField>
  );
}
