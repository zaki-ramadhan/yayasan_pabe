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
      {/* 1. Posisi yang dilamar (Konsisten bergaya Input readOnly seperti nama/email) */}
      <FormField label="Posisi yang dilamar">
        <Input
          type="text"
          value={`${job.title} • ${job.location}`}
          readOnly
          className="h-10 text-sm font-normal bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
        />
      </FormField>

      {/* 2. Data Identitas Kontak (Nama, Email, WA) */}
      <CareerApplicantPersonalFields
        formData={formData}
        onChange={onChange}
        onBlur={onBlur}
        onPhoneChange={onPhoneChange}
        isNameLocked={isNameLocked}
        isEmailLocked={isEmailLocked}
        errors={errors}
      />

      {/* 3. Berkas CV / Resume (Kondisional: Ditampilkan hanya jika lowongan mewajibkan berkas) */}
      {requiresResume && (
        <CareerResumeUpload
          value={formData.resumeUrl}
          onChange={(url) => onChange("resumeUrl", url)}
          error={errors.resumeUrl}
        />
      )}

      {/* 4. Surat Pengantar & Motivasi Bergabung */}
      <CareerApplicantProfileFields
        formData={formData}
        onChange={onChange}
        onBlur={onBlur}
        errors={errors}
      />
    </div>
  );
}
