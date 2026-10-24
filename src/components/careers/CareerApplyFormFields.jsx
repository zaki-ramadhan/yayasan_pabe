"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function CareerApplyFormFields({
  job,
  formData,
  onChange,
  onPhoneChange,
}) {
  return (
    <>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">
          Posisi Yang Dilamar
        </label>
        <Input
          type="text"
          value={`${job.title} • ${job.location}`}
          disabled
          className="bg-slate-50 text-slate-500 text-xs h-9 cursor-not-allowed"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Nama Lengkap <span className="text-rose-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Contoh: Muhammad Ihsan"
            value={formData.fullName}
            onChange={(e) => onChange("fullName", e.target.value)}
            required
            autoComplete="name"
            className="text-xs h-9"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Email Aktif <span className="text-rose-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="nama@email.com"
            value={formData.email}
            onChange={(e) => onChange("email", e.target.value)}
            required
            autoComplete="email"
            className="text-xs h-9"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            No. WhatsApp / HP <span className="text-rose-500">*</span>
          </label>
          <Input
            type="tel"
            inputMode="numeric"
            placeholder="081234567890"
            value={formData.phone}
            onChange={onPhoneChange}
            required
            autoComplete="tel"
            className="text-xs h-9"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Tautan Profil LinkedIn / Portofolio
          </label>
          <Input
            type="url"
            placeholder="https://linkedin.com/in/..."
            value={formData.linkedinUrl}
            onChange={(e) => onChange("linkedinUrl", e.target.value)}
            className="text-xs h-9"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">
          Tautan Berkas CV / Resume (Google Drive / Drop Link){" "}
          <span className="text-rose-500">*</span>
        </label>
        <Input
          type="url"
          placeholder="https://drive.google.com/file/d/..."
          value={formData.resumeUrl}
          onChange={(e) => onChange("resumeUrl", e.target.value)}
          required
          className="text-xs h-9"
        />
        <p className="text-[11px] text-slate-400">
          Pastikan akses berkas Google Drive telah diatur ke publik (&ldquo;Anyone with link can view&rdquo;).
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-700">
          Surat Pengantar &amp; Motivasi Bergabung <span className="text-rose-500">*</span>
        </label>
        <Textarea
          placeholder="Ceritakan secara ringkas latar belakang, keahlian, dan motivasi Anda bergabung bersama yayasan..."
          value={formData.coverLetter}
          onChange={(e) => onChange("coverLetter", e.target.value)}
          rows={3}
          required
          className="text-xs resize-none"
        />
      </div>
    </>
  );
}
