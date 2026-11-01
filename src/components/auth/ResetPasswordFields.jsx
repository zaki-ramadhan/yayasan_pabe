"use client";

import { AuthPasswordInput } from "@/components/auth/AuthPasswordInput";

/**
 * Komponen sub-form modular untuk input kata sandi baru dan konfirmasi kata sandi.
 * Single Responsibility: Mengatur input kata sandi dan umpan balik kesalahan per-field.
 */
export function ResetPasswordFields({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  errors,
  setErrors,
  disabled = false,
}) {
  return (
    <>
      <AuthPasswordInput
        id="new-password"
        label="Kata sandi baru"
        placeholder="Minimal 6 karakter"
        value={password}
        disabled={disabled}
        onChange={(e) => {
          setPassword(e.target.value);
          if (errors.password) {
            setErrors((prev) => ({ ...prev, password: undefined }));
          }
        }}
        onBlur={() => {
          if (password && password.length < 6) {
            setErrors((prev) => ({
              ...prev,
              password: "Kata sandi minimal 6 karakter.",
            }));
          }
        }}
        error={errors.password}
        autoComplete="new-password"
      />

      <AuthPasswordInput
        id="confirm-password"
        label="Konfirmasi kata sandi"
        placeholder="Ulangi kata sandi baru"
        value={confirmPassword}
        disabled={disabled}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          if (errors.confirmPassword) {
            setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }
        }}
        onBlur={() => {
          if (confirmPassword && confirmPassword !== password) {
            setErrors((prev) => ({
              ...prev,
              confirmPassword: "Konfirmasi kata sandi tidak cocok.",
            }));
          }
        }}
        error={errors.confirmPassword}
        autoComplete="new-password"
      />
    </>
  );
}
