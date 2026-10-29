"use client";

import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { AuthPasswordInput } from "@/components/auth/AuthPasswordInput";
import {
  sanitizeEmail,
  sanitizePhone,
  validateEmail,
  validatePhone,
  stripEmojis,
  validateUsername,
  containsReservedKeyword,
} from "@/lib/security";
import { cn } from "@/lib/utils";

export function RegisterInputFields({
  username,
  setUsername,
  email,
  setEmail,
  phone,
  setPhone,
  password,
  setPassword,
  agreeTerms,
  setAgreeTerms,
  errors,
  setErrors,
  onOpenTerms,
}) {
  return (
    <>
      {/* 1. Nama Pengguna (Username) */}
      <FormField
        label="Nama pengguna"
        required
        error={errors.username}
      >
        <Input
          type="text"
          placeholder="contoh: ahmad_fauzi"
          value={username}
          maxLength={30}
          onChange={(e) => {
            const clean = stripEmojis(e.target.value).replace(/[^a-zA-Z0-9_.]/g, "").slice(0, 30);
            setUsername(clean);

            if (clean.length >= 3) {
              const reservedCheck = containsReservedKeyword(clean);
              if (reservedCheck.isReserved) {
                setErrors((prev) => ({
                  ...prev,
                  username: `Nama pengguna tidak boleh mengandung istilah yang dicadangkan sistem ("${reservedCheck.matchedWord}").`,
                }));
                return;
              }
            }
            if (errors.username) {
              setErrors((prev) => ({ ...prev, username: undefined }));
            }
          }}
          onBlur={() => {
            if (username) {
              const res = validateUsername(username);
              if (!res.isValid) {
                setErrors((prev) => ({ ...prev, username: res.message }));
              }
            }
          }}
          autoComplete="username"
          className="h-11 text-sm font-normal"
        />
      </FormField>

      {/* 2. Email */}
      <FormField
        label="Alamat email"
        required
        error={errors.email}
      >
        <Input
          type="email"
          placeholder="nama@email.com"
          value={email}
          maxLength={100}
          onChange={(e) => {
            const clean = sanitizeEmail(e.target.value).slice(0, 100);
            setEmail(clean);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          onBlur={() => {
            if (email) {
              const res = validateEmail(email, true);
              if (!res.valid) {
                setErrors((prev) => ({ ...prev, email: res.error }));
              }
            }
          }}
          autoComplete="email"
          className="h-11 text-sm font-normal"
        />
      </FormField>

      {/* 3. Nomor WhatsApp Aktif */}
      <FormField
        label="Nomor WhatsApp aktif"
        required
        error={errors.phone}
      >
        <Input
          type="tel"
          inputMode="tel"
          placeholder="081234567890"
          value={phone}
          maxLength={15}
          onChange={(e) => {
            const clean = sanitizePhone(e.target.value).slice(0, 15);
            setPhone(clean);
            if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          onBlur={() => {
            if (phone) {
              const res = validatePhone(phone);
              if (!res.valid) {
                setErrors((prev) => ({ ...prev, phone: res.error }));
              }
            }
          }}
          autoComplete="tel"
          className="h-11 text-sm font-normal"
        />
      </FormField>

      {/* 4. Kata Sandi */}
      <AuthPasswordInput
        id="password"
        label="Kata sandi"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
        }}
        onBlur={() => {
          if (password && password.length < 6) {
            setErrors((prev) => ({ ...prev, password: "Kata sandi minimal 6 karakter." }));
          }
        }}
        placeholder="Buat kata sandi akun"
        helperText="Gunakan minimal 6 karakter."
        error={errors.password}
        autoComplete="new-password"
      />

      {/* 5. Agree Terms Checkbox */}
      <div className="space-y-1 pt-1">
        <div className="flex items-start gap-2.5">
          <input
            type="checkbox"
            id="agree"
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked);
              if (errors.agreeTerms) setErrors((prev) => ({ ...prev, agreeTerms: undefined }));
            }}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer shrink-0"
          />
          <div className="text-sm text-slate-700 leading-normal">
            <label htmlFor="agree" className="cursor-pointer select-none">
              Saya menyetujui{" "}
            </label>
            <button
              type="button"
              onClick={onOpenTerms}
              className="text-primary hover:underline font-medium cursor-pointer inline text-left"
            >
              Ketentuan Akad &amp; Kebijakan Privasi Yayasan
            </button>
            <span>.</span>
          </div>
        </div>
        {errors.agreeTerms && (
          <p className="text-xs text-rose-600 font-medium mt-1 pl-6">{errors.agreeTerms}</p>
        )}
      </div>
    </>
  );
}
