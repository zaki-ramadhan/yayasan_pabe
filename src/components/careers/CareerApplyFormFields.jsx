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
          readOnly
          className="h-10 text-sm font-normal bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
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
