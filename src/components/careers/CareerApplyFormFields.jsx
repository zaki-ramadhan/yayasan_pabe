"use client";

import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { CareerApplicantPersonalFields } from "./CareerApplicantPersonalFields";
import { CareerResumeUpload } from "./CareerResumeUpload";
import { CareerApplicantProfileFields } from "./CareerApplicantProfileFields";

/**
 * Komponen koordinator tata letak formulir lamaran karier (SRP & Anti-God Component).
 * Posisi yang dilamar bergaya input readOnly konsisten dengan input nama/email terkunci.
 * Berkas CV kondisional sesuai keputusan admin lowongan (requiresResume).
 *
 * @param {object} props
 */
export function CareerApplyFormFields({
  job,
  formData,
  onChange,
  onBlur,
  onPhoneChange,
  isNameLocked = false,
  isEmailLocked = false,
  requiresResume = true,
  errors = {},
}) {
  return (
    <div className="space-y-4">
      <FormField label="Posisi yang dilamar">
        <Input
          type="text"
          value={`${job.title} • ${job.location}`}
          isLocked
          lockedNotice="Posisi lowongan telah disesuaikan dengan pilihan Anda."
          className="h-10 text-sm font-normal"
        />
      </FormField>

      <CareerApplicantPersonalFields
        formData={formData}
        onChange={onChange}
        onBlur={onBlur}
        onPhoneChange={onPhoneChange}
        isNameLocked={isNameLocked}
        isEmailLocked={isEmailLocked}
        errors={errors}
      />

      {requiresResume && (
        <CareerResumeUpload
          value={formData.resumeUrl}
          onChange={(url) => onChange("resumeUrl", url)}
          error={errors.resumeUrl}
        />
      )}

      <CareerApplicantProfileFields
        formData={formData}
        onChange={onChange}
        onBlur={onBlur}
        errors={errors}
      />
    </div>
  );
}
