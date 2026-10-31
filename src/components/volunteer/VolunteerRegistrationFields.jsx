"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FormField } from "@/components/ui/FormField";
import { VolunteerRegionSelector } from "@/components/volunteer/VolunteerRegionSelector";
import { cn } from "@/lib/utils";
import {
  sanitizeName,
  sanitizePhone,
  sanitizeEmail,
  sanitizeStandardText,
} from "@/lib/security";

/**
 * Sub-widget formulir pendaftaran relawan murni (SRP).
 * Mengunci nama lengkap dan email jika disinkronkan dari akun login.
 */
export function VolunteerRegistrationFields({
  fullName,
  setFullName,
  isNameLocked = false,
  phone,
  setPhone,
  email,
  setEmail,
  isEmailLocked = false,
  city,
  setCity,
  motivation,
  setMotivation,
  loading = false,
  isFormValid = false,
  errors = {},
  setErrors,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm space-y-5"
    >
      <div className="space-y-1">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Formulir Pendaftaran Relawan
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Lengkapi data diri di bawah untuk bergabung menjadi bagian dari aksi kebaikan yayasan.
        </p>
      </div>

      {/* 1. Nama Lengkap (Terkunci jika login, dengan info sinkronisasi) */}
      <FormField
        label="Nama lengkap"
        required
        error={errors.fullName}
        hint={
          isNameLocked
            ? "Nama lengkap disinkronkan dari profil akun Anda. Ubah di pengaturan profil jika ada kekeliruan."
            : undefined
        }
      >
        <Input
          type="text"
          required
          readOnly={isNameLocked}
          value={fullName}
          maxLength={60}
          onChange={(e) => {
            if (isNameLocked) return;
            setFullName(sanitizeName(e.target.value));
            if (errors.fullName) {
              setErrors((prev) => ({ ...prev, fullName: undefined }));
            }
          }}
          onBlur={() => {
            if (!isNameLocked) setFullName((prev) => prev.trim());
          }}
          placeholder="Nama lengkap sesuai KTP"
          className={cn(
            "h-11 font-normal",
            isNameLocked &&
              "bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
          )}
        />
      </FormField>

      {/* 2. WhatsApp & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Nomor WhatsApp aktif"
          required
          error={errors.phone}
          hint="Digunakan untuk koordinasi aksi relawan."
        >
          <Input
            type="tel"
            inputMode="numeric"
            required
            value={phone}
            maxLength={16}
            onChange={(e) => {
              const val = sanitizePhone(e.target.value);
              setPhone(val);
              if (errors.phone) {
                setErrors((prev) => ({ ...prev, phone: undefined }));
              }
            }}
            onBlur={() => setPhone((prev) => prev.trim())}
            placeholder="08xxxxxxxxxx"
            className="h-11 font-normal"
          />
        </FormField>

        <FormField
          label="Alamat email"
          required
          error={errors.email}
          hint={
            isEmailLocked
              ? "Email disinkronkan otomatis dari akun Anda."
              : "Notifikasi KTA akan dikirim ke email ini."
          }
        >
          <Input
            type="email"
            required
            readOnly={isEmailLocked}
            value={email}
            maxLength={80}
            onChange={(e) => {
              if (isEmailLocked) return;
              const val = sanitizeEmail(e.target.value);
              setEmail(val);
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            onBlur={() => setEmail((prev) => prev.trim())}
            placeholder="email@anda.com"
            className={cn(
              "h-11 font-normal",
              isEmailLocked &&
                "bg-slate-100 text-slate-700 border-slate-200 cursor-not-allowed select-none focus:ring-0 focus:border-slate-200"
            )}
          />
        </FormField>
      </div>

      {/* 3. Wilayah Domisili (Provinsi & Kota/Kabupaten Berjenjang) */}
      <VolunteerRegionSelector
        selectedCity={city}
        onCityChange={(newCity) => {
          setCity(newCity);
          if (errors.city) {
            setErrors((prev) => ({ ...prev, city: undefined }));
          }
        }}
        error={errors.city}
        onClearError={() => {
          if (errors.city) {
            setErrors((prev) => ({ ...prev, city: undefined }));
          }
        }}
        disabled={loading}
      />

      {/* 4. Motivasi Relawan */}
      <FormField
        label="Motivasi atau pengalaman singkat"
        error={errors.motivation}
        hint="Ceritakan alasan ketertarikan Anda atau keahlian yang ingin dibagikan (opsional)."
      >
        <Textarea
          value={motivation}
          maxLength={500}
          rows={3}
          onChange={(e) => {
            setMotivation(sanitizeStandardText(e.target.value));
            if (errors.motivation) {
              setErrors((prev) => ({ ...prev, motivation: undefined }));
            }
          }}
          placeholder="Ceritakan motivasi Anda bergabung dalam aksi kebaikan..."
          className="resize-none font-normal"
        />
        <div className="flex justify-end pt-1">
          <span className="text-[11px] text-slate-400">
            {motivation.length}/500 karakter
          </span>
        </div>
      </FormField>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Mengirim pendaftaran..." : "Kirim pendaftaran relawan"}
      </Button>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        Dengan mendaftar, Anda menyetujui koordinasi aksi sosial dan kode etik relawan Yayasan Payung Berkah.
      </p>
    </form>
  );
}

export default VolunteerRegistrationFields;
