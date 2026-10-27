"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { cn } from "@/lib/utils";

export function CareerApplyFormFields({
  job,
  formData,
  onChange,
  onPhoneChange,
  isEmailLocked = false,
  errors = {},
}) {
  return (
    <>
      <FormField label="Posisi yang dilamar">
        <Input
          type="text"
          value={`${job.title} • ${job.location}`}
          disabled
          className="bg-slate-50 text-slate-500 text-xs h-9 cursor-not-allowed"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          label="Nama lengkap"
          required
          error={errors.fullName}
        >
          <Input
            type="text"
            placeholder="Contoh: Muhammad Ihsan"
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            required
            autoComplete="name"
            className="text-xs h-9 font-normal"
          />
        </FormField>

        <FormField
          label="Email aktif"
          required
          error={errors.email}
          hint={isEmailLocked ? "Email terkunci sesuai akun login Anda." : undefined}
        >
          <Input
            type="email"
            placeholder="nama@email.com"
            value={formData.email}
            readOnly={isEmailLocked}
            onChange={(e) => {
              if (!isEmailLocked) {
                onChange("email", e.target.value);
              }
            }}
            required
            autoComplete="email"
            className={cn(
              "text-xs h-9 font-normal",
              isEmailLocked && "bg-slate-100 text-slate-600 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
            )}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          label="Nomor WhatsApp / HP"
          required
          error={errors.phone}
        >
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="081234567890"
            value={formData.phone}
            onChange={onPhoneChange}
            required
            autoComplete="tel"
            className="text-xs h-9 font-normal"
          />
        </FormField>

        <FormField
          label="Tautan LinkedIn / portofolio"
          error={errors.linkedinUrl}
        >
          <Input
            type="url"
            placeholder="https://linkedin.com/in/..."
            value={formData.linkedinUrl}
            onChange={(e) => onChange("linkedinUrl", e.target.value)}
            className="text-xs h-9 font-normal"
          />
        </FormField>
      </div>

      <FormField
        label="Tautan berkas CV / resume"
        required
        error={errors.resumeUrl}
        hint="Pastikan izin akses Google Drive / link telah diatur ke publik agar dapat ditinjau HRD."
      >
        <Input
          type="url"
          placeholder="https://drive.google.com/file/d/..."
          value={formData.resumeUrl}
          onChange={(e) => onChange("resumeUrl", e.target.value)}
          required
          className="text-xs h-9 font-normal"
        />
      </FormField>

      <FormField
        label="Surat pengantar & motivasi bergabung"
        required
        error={errors.coverLetter}
      >
        <Textarea
          placeholder="Ceritakan secara ringkas latar belakang, keahlian, dan motivasi Anda bergabung bersama yayasan..."
          value={formData.coverLetter}
          onChange={(e) => onChange("coverLetter", e.target.value)}
          rows={3}
          required
          className="text-xs resize-none"
        />
      </FormField>
    </>
  );
}
