"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

export function CareerApplyFormFields({
  job,
  formData,
  onChange,
  onBlur,
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
            maxLength={60}
            onChange={(e) => onChange("fullName", e.target.value)}
            onBlur={onBlur ? onBlur("fullName") : undefined}
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
            inputMode="email"
            maxLength={100}
            spellCheck={false}
            placeholder="nama@email.com"
            value={formData.email}
            readOnly={isEmailLocked}
            onChange={(e) => {
              if (!isEmailLocked) {
                onChange("email", e.target.value);
              }
            }}
            onBlur={onBlur ? onBlur("email") : undefined}
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
            inputMode="tel"
            maxLength={15}
            placeholder="081234567890"
            value={formData.phone}
            onChange={onPhoneChange}
            onBlur={onBlur ? onBlur("phone") : undefined}
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
            inputMode="url"
            maxLength={200}
            spellCheck={false}
            placeholder="https://linkedin.com/in/..."
            value={formData.linkedinUrl}
            onChange={(e) => onChange("linkedinUrl", e.target.value)}
            onBlur={onBlur ? onBlur("linkedinUrl") : undefined}
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
          inputMode="url"
          maxLength={300}
          spellCheck={false}
          placeholder="https://drive.google.com/file/d/..."
          value={formData.resumeUrl}
          onChange={(e) => onChange("resumeUrl", e.target.value)}
          onBlur={onBlur ? onBlur("resumeUrl") : undefined}
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
          maxLength={1000}
          onChange={(e) => onChange("coverLetter", e.target.value)}
          onBlur={onBlur ? onBlur("coverLetter") : undefined}
          rows={3}
          required
          className="text-xs resize-none"
        />
      </FormField>
    </>
  );
}
