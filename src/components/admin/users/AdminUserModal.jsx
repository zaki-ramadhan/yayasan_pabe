/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { USER_ROLES } from "@/services/authService";
import { validateEmail, validatePhone } from "@/lib/validator";
import { isFormDirty } from "@/lib/formUtils";
import {
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeStandardText,
} from "@/lib/sanitizer";
import { AdminUserGenderSelect } from "./AdminUserGenderSelect";
import { AdminUserTitleCombobox } from "./AdminUserTitleCombobox";
import { isInfrastructureEmail } from "@/lib/infrastructureConstants";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

/**
 * Modal form untuk menambah atau memperbarui data pengurus yayasan.
 * Mendukung mode praktis tanpa akses login (hanya profil struktural publik)
 * maupun mode staf operasional dengan kredensial login dashboard.
 */
export function AdminUserModal({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  userToEdit = null,
  currentUser = null,
  isLoading = false,
  isSubmitting = false,
}) {
  const activeUser = user || userToEdit;
  const isEdit = !!activeUser;
  const isPending = isLoading || isSubmitting;
  const canAssignSuperAdmin = isInfrastructureEmail(currentUser?.email);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: USER_ROLES.ADMIN,
    title: "",
    gender: "MALE",
    password: "",
    hasLoginAccess: false,
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (activeUser) {
      const isInternal = Boolean(
        activeUser.email?.endsWith("@internal.yayasanpayungberkah.org")
      );
      const initialHasLogin = Boolean(
        activeUser.hasLoginAccess ?? (!isInternal && activeUser.email)
      );

      setFormData({
        name: activeUser.name || "",
        email: isInternal ? "" : activeUser.email || "",
        phone: activeUser.phone || "",
        role: activeUser.role || USER_ROLES.ADMIN,
        title: activeUser.title || "",
        gender: activeUser.gender || "MALE",
        password: "",
        hasLoginAccess: initialHasLogin,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: USER_ROLES.ADMIN,
        title: "",
        gender: "MALE",
        password: "",
        hasLoginAccess: false,
      });
    }
    setErrorMsg("");
    setErrors({});
  }, [activeUser, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhone = formData.phone.trim();
    const cleanTitle = formData.title.trim();
    const cleanPassword = formData.password.trim();

    const newErrors = {};
    if (!cleanName || cleanName.length < 2) {
      newErrors.name = "Nama lengkap wajib diisi minimal 2 karakter.";
    }

    if (!cleanTitle || cleanTitle.length < 2) {
      newErrors.title = "Jabatan struktural di yayasan wajib dipilih atau diisi.";
    }

    if (formData.hasLoginAccess) {
      if (!cleanEmail) {
        newErrors.email = "Alamat email login wajib diisi.";
      } else {
        const emailVal = validateEmail(cleanEmail, true);
        if (!emailVal.isValid) {
          newErrors.email = emailVal.message || "Format alamat email tidak valid.";
        }
      }

      if (!isEdit) {
        if (!cleanPassword) {
          newErrors.password = "Kata sandi awal wajib diisi minimal 6 karakter.";
        } else if (cleanPassword.length < 6) {
          newErrors.password = "Kata sandi awal minimal 6 karakter.";
        }
      } else if (cleanPassword && cleanPassword.length < 6) {
        newErrors.password = "Kata sandi minimal 6 karakter jika ingin diubah.";
      }
    } else if (cleanEmail) {
      const emailVal = validateEmail(cleanEmail, true);
      if (!emailVal.isValid) {
        newErrors.email = emailVal.message || "Format alamat email tidak valid.";
      }
    }

    if (cleanPhone) {
      const phoneVal = validatePhone(cleanPhone, {
        isRequired: false,
        fieldName: "Nomor telepon",
      });
      if (!phoneVal.isValid) {
        newErrors.phone = phoneVal.message;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setErrorMsg(Object.values(newErrors)[0]);
      return;
    }

    setErrors({});
    setErrorMsg("");
    onSubmit({
      ...formData,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      title: cleanTitle,
      gender: formData.gender,
      password: cleanPassword,
      hasLoginAccess: formData.hasLoginAccess,
    });
  };

  const isDirty = useMemo(() => {
    if (!isEdit || !activeUser) {
      return Boolean(
        formData.name.trim() ||
        formData.title.trim() ||
        formData.phone.trim() ||
        formData.email.trim()
      );
    }
    const isInternal = Boolean(
      activeUser.email?.endsWith("@internal.yayasanpayungberkah.org")
    );
    return isFormDirty(
      {
        name: activeUser.name || "",
        email: isInternal ? "" : activeUser.email || "",
        phone: activeUser.phone || "",
        role: activeUser.role || USER_ROLES.ADMIN,
        title: activeUser.title || "",
        gender: activeUser.gender || "MALE",
        hasLoginAccess: Boolean(activeUser.hasLoginAccess ?? !isInternal),
      },
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        title: formData.title,
        gender: formData.gender,
        hasLoginAccess: formData.hasLoginAccess,
      }
    );
  }, [isEdit, activeUser, formData]);

  const isFormValid = useMemo(() => {
    const hasName = formData.name.trim().length >= 2;
    const hasTitle = formData.title.trim().length >= 2;
    const phoneTrim = formData.phone.trim();
    const hasValidPhone =
      !phoneTrim || validatePhone(phoneTrim, { isRequired: false }).isValid;

    if (!hasName || !hasTitle || !hasValidPhone) return false;

    if (formData.hasLoginAccess) {
      const hasValidEmail = validateEmail(formData.email.trim(), true).isValid;
      const passTrim = formData.password.trim();
      const hasValidPass = isEdit
        ? !passTrim || passTrim.length >= 6
        : passTrim.length >= 6;
      return Boolean(hasValidEmail && hasValidPass);
    }

    const emailTrim = formData.email.trim();
    if (emailTrim) {
      return validateEmail(emailTrim, true).isValid;
    }

    return true;
  }, [
    formData.name,
    formData.title,
    formData.phone,
    formData.hasLoginAccess,
    formData.email,
    formData.password,
    isEdit,
  ]);

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="max-w-2xl"
      title={isEdit ? "Ubah data pengurus" : "Tambah pengurus baru"}
      submitText="Simpan"
      submittingText="Menyimpan..."
      isSubmitting={isPending}
      submitDisabled={!isFormValid || (isEdit && !isDirty)}
      formClassName="space-y-4 py-1 text-sm"
    >
      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs font-normal text-rose-700">
          {errorMsg}
        </div>
      )}

      {/* Bagian 1: Identitas & Struktur Organisasi */}
      <div className="space-y-3.5">
        <FormField label="Nama lengkap" required error={errors.name}>
          <Input
            type="text"
            required
            autoComplete="name"
            minLength={FIELD_LIMITS.NAME.min}
            maxLength={FIELD_LIMITS.NAME.max}
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                name: sanitizeName(e.target.value),
              }));
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            onBlur={() =>
              setFormData((prev) => ({ ...prev, name: prev.name.trim() }))
            }
            placeholder="Contoh: Drs. H. M. Fauzan, M.Pd"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          <AdminUserTitleCombobox
            value={formData.title}
            onChange={(val) => {
              setFormData((prev) => ({
                ...prev,
                title: sanitizeStandardText(val, 60),
              }));
              if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
            }}
            error={errors.title}
            hint="Contoh: Ketua Dewan Pembina, Sekretaris."
          />

          <FormField
            label={
              formData.hasLoginAccess
                ? "Alamat email login"
                : "Alamat email (opsional)"
            }
            required={formData.hasLoginAccess}
            hint={
              formData.hasLoginAccess
                ? "Wajib untuk akun login dashboard."
                : "Kosongkan jika tidak memakai email."
            }
            error={errors.email}
          >
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              minLength={FIELD_LIMITS.EMAIL.min}
              maxLength={FIELD_LIMITS.EMAIL.max}
              spellCheck={false}
              required={formData.hasLoginAccess}
              disabled={isEdit && !formData.hasLoginAccess}
              value={formData.email}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  email: sanitizeEmail(e.target.value),
                }));
                if (errors.email)
                  setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              onBlur={() =>
                setFormData((prev) => ({ ...prev, email: prev.email.trim() }))
              }
              placeholder={
                formData.hasLoginAccess
                  ? "nama@pabe.or.id"
                  : "nama@email.com (opsional)"
              }
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
          <AdminUserGenderSelect
            value={formData.gender}
            onChange={(val) =>
              setFormData((prev) => ({ ...prev, gender: val }))
            }
            error={errors.gender}
          />

          <FormField label="Nomor WhatsApp" error={errors.phone}>
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              minLength={FIELD_LIMITS.PHONE.min}
              maxLength={FIELD_LIMITS.PHONE.max}
              value={formData.phone}
              onChange={(e) => {
                setFormData((prev) => ({
                  ...prev,
                  phone: sanitizePhone(e.target.value),
                }));
              }}
              onBlur={() =>
                setFormData((prev) => ({ ...prev, phone: prev.phone.trim() }))
              }
              placeholder="081234567890 (opsional)"
            />
          </FormField>
        </div>
      </div>

      {/* Bagian 2: Pengaturan Hak Akses Login Dashboard */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-3">
        {/* Checkbox 1: Akses Admin Operasional */}
        <div className="flex items-start gap-3">
          <Checkbox
            id="hasLoginAccess"
            checked={formData.hasLoginAccess && formData.role !== USER_ROLES.SUPER_ADMIN}
            onCheckedChange={(checked) => {
              const isChecked = Boolean(checked);
              setFormData((prev) => ({
                ...prev,
                hasLoginAccess: isChecked,
                role: isChecked ? USER_ROLES.ADMIN : USER_ROLES.ADMIN,
                password: isChecked
                  ? prev.password || (!isEdit ? "Pabe2026!" : "")
                  : "",
              }));
              if (!isChecked) {
                setErrors((prev) => ({
                  ...prev,
                  email: undefined,
                  password: undefined,
                }));
              }
            }}
            className="mt-0.5 cursor-pointer"
          />
          <div className="space-y-0.5 leading-none">
            <label
              htmlFor="hasLoginAccess"
              className="text-sm font-medium text-slate-900 cursor-pointer select-none"
            >
              Beri hak akses admin
            </label>
            <p className="text-xs text-slate-500 font-normal mt-0.5">
              Mengelola program donasi, rekam penyaluran, artikel, dan operasional harian.
            </p>
          </div>
        </div>

        {/* Checkbox 2: Akses Super Admin (Hanya tampil bagi Developer) */}
        {canAssignSuperAdmin && (
          <div className="flex items-start gap-3 pt-2.5 border-t border-slate-200/80">
            <Checkbox
              id="isSuperAdminAccess"
              checked={formData.hasLoginAccess && formData.role === USER_ROLES.SUPER_ADMIN}
              onCheckedChange={(checked) => {
                const isChecked = Boolean(checked);
                setFormData((prev) => ({
                  ...prev,
                  hasLoginAccess: isChecked,
                  role: isChecked ? USER_ROLES.SUPER_ADMIN : USER_ROLES.ADMIN,
                  password: isChecked
                    ? prev.password || (!isEdit ? "Pabe2026!" : "")
                    : "",
                }));
                if (!isChecked) {
                  setErrors((prev) => ({
                    ...prev,
                    email: undefined,
                    password: undefined,
                  }));
                }
              }}
              className="mt-0.5 cursor-pointer data-[state=checked]:bg-purple-700 data-[state=checked]:border-purple-700"
            />
            <div className="space-y-0.5 leading-none">
              <label
                htmlFor="isSuperAdminAccess"
                className="text-sm font-medium text-slate-900 cursor-pointer select-none flex items-center gap-1.5"
              >
                <span>Beri hak akses Super admin</span>
                <span className="text-sm font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                  Otoritas penuh
                </span>
              </label>
              <p className="text-sm text-slate-500 font-normal mt-0.5">
                Memiliki kendali penuh atas sistem, termasuk menambah, mengatur akses, dan menghapus pengurus lain.
              </p>
            </div>
          </div>
        )}

        {formData.hasLoginAccess && (
          <div className="pt-3 border-t border-slate-200 space-y-3.5 animate-in fade-in duration-150">
            {!isEdit ? (
              <FormField
                label="Kata sandi awal"
                required
                hint="Kata sandi sementara untuk login pertama kali (minimal 6 karakter)."
                error={errors.password}
              >
                <Input
                  type="text"
                  required
                  minLength={FIELD_LIMITS.PASSWORD_SIMPLE.min}
                  maxLength={FIELD_LIMITS.PASSWORD_SIMPLE.max}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }));
                    if (errors.password)
                      setErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                  }}
                  onBlur={() => {
                    const pass = formData.password.trim();
                    setFormData((prev) => ({ ...prev, password: pass }));
                    if (!pass) {
                      setErrors((prev) => ({
                        ...prev,
                        password: "Kata sandi awal wajib diisi.",
                      }));
                    } else if (pass.length < FIELD_LIMITS.PASSWORD_SIMPLE.min) {
                      setErrors((prev) => ({
                        ...prev,
                        password: `Kata sandi awal minimal ${FIELD_LIMITS.PASSWORD_SIMPLE.min} karakter.`,
                      }));
                    }
                  }}
                  placeholder="Contoh: Pabe2026!"
                />
              </FormField>
            ) : (
              <FormField
                label="Ubah kata sandi (opsional)"
                hint="Kosongkan jika tidak ingin memperbarui kata sandi akun ini."
                error={errors.password}
              >
                <Input
                  type="text"
                  minLength={FIELD_LIMITS.PASSWORD_SIMPLE.min}
                  maxLength={FIELD_LIMITS.PASSWORD_SIMPLE.max}
                  value={formData.password}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }));
                    if (errors.password)
                      setErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                  }}
                  onBlur={() => {
                    const pass = formData.password.trim();
                    setFormData((prev) => ({ ...prev, password: pass }));
                    if (pass && pass.length < FIELD_LIMITS.PASSWORD_SIMPLE.min) {
                      setErrors((prev) => ({
                        ...prev,
                        password: `Kata sandi minimal ${FIELD_LIMITS.PASSWORD_SIMPLE.min} karakter jika diisi.`,
                      }));
                    }
                  }}
                  placeholder="Masukkan kata sandi baru jika ingin mengganti"
                />
              </FormField>
            )}
          </div>
        )}
      </div>
    </FormDialog>
  );
}
