/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { MANAGEABLE_ROLES } from "@/lib/userParser";
import { USER_ROLES } from "@/services/authService";
import { validateEmail, validatePhone } from "@/lib/validator";
import { isFormDirty } from "@/lib/formUtils";
import {
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeStandardText,
} from "@/lib/sanitizer";

export function AdminUserModal({
  isOpen,
  onClose,
  onSubmit,
  user = null,
  isLoading = false,
}) {
  const isEdit = !!user;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: USER_ROLES.ADMIN,
    title: "",
    password: "",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || USER_ROLES.ADMIN,
        title: user.title || "",
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: USER_ROLES.ADMIN,
        title: "",
        password: "",
      });
    }
    setErrorMsg("");
    setErrors({});
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhone = formData.phone.trim();
    const cleanTitle = formData.title.trim();
    const cleanPassword = formData.password.trim();

    const newErrors = {};
    if (!cleanName) {
      newErrors.name = "Nama lengkap wajib diisi.";
    }
    const emailVal = validateEmail(cleanEmail, true);
    if (!emailVal.isValid) {
      newErrors.email = emailVal.message || "Format alamat email tidak valid.";
    }
    if (cleanPhone) {
      const phoneVal = validatePhone(cleanPhone, { isRequired: false, fieldName: "Nomor telepon" });
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
      password: cleanPassword,
    });
  };

  const isDirty = useMemo(() => {
    if (!isEdit || !user) {
      return Boolean(formData.name.trim() || formData.email.trim() || formData.password.trim());
    }
    return isFormDirty(
      {
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || USER_ROLES.ADMIN,
        title: user.title || "",
      },
      {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        title: formData.title,
      }
    );
  }, [isEdit, user, formData]);

  const isFormValid = useMemo(() => {
    const hasName = formData.name.trim().length >= 2;
    const hasValidEmail = validateEmail(formData.email.trim(), true).isValid;
    const hasValidPass = isEdit || formData.password.trim().length >= 6;
    return Boolean(hasName && hasValidEmail && hasValidPass);
  }, [formData.name, formData.email, formData.password, isEdit]);

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      maxWidth="max-w-2xl"
      title={isEdit ? "Ubah data pengurus" : "Tambah pengurus baru"}
      submitText="Simpan"
      submittingText="Menyimpan..."
      isSubmitting={isLoading}
      submitDisabled={!isFormValid || (isEdit && !isDirty)}
      formClassName="space-y-3.5 py-1 text-sm"
    >
      {errorMsg && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-md text-xs font-normal text-rose-700">
          {errorMsg}
        </div>
      )}

      <FormField label="Nama lengkap" required error={errors.name}>
        <Input
          type="text"
          required
          autoComplete="name"
          maxLength={60}
          value={formData.name}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, name: sanitizeName(e.target.value) }));
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          onBlur={() => setFormData((prev) => ({ ...prev, name: prev.name.trim() }))}
          placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd"
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Alamat email" required error={errors.email}>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={100}
            spellCheck={false}
            required
            disabled={isEdit}
            value={formData.email}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, email: sanitizeEmail(e.target.value) }));
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            onBlur={() => setFormData((prev) => ({ ...prev, email: prev.email.trim() }))}
            placeholder="nama@pabe.or.id"
          />
        </FormField>
        <FormField label="Nomor telepon" error={errors.phone}>
          <Input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={15}
            value={formData.phone}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, phone: sanitizePhone(e.target.value) }));
            }}
            onBlur={() => setFormData((prev) => ({ ...prev, phone: prev.phone.trim() }))}
            placeholder="0812-xxxx-xxxx"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Peran sistem" required>
          <Select
            value={formData.role}
            onValueChange={(val) => setFormData((prev) => ({ ...prev, role: val }))}
          >
            <SelectTrigger className="w-full h-10 text-sm font-normal bg-white border border-slate-300 rounded-lg">
              <SelectValue placeholder="Pilih peran" />
            </SelectTrigger>
            <SelectContent className="bg-white border border-slate-200 z-50">
              {MANAGEABLE_ROLES.map((roleOpt) => (
                <SelectItem
                  key={roleOpt.value}
                  value={roleOpt.value}
                  className="cursor-pointer text-sm font-normal py-2"
                >
                  {roleOpt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField label="Jabatan struktural">
          <Input
            type="text"
            maxLength={60}
            value={formData.title}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                title: sanitizeStandardText(e.target.value, 60),
              }));
            }}
            onBlur={() => setFormData((prev) => ({ ...prev, title: prev.title.trim() }))}
            placeholder="Contoh: Staf Verifikasi Kas"
          />
        </FormField>
      </div>

      {!isEdit && (
        <FormField
          label="Kata sandi awal (opsional)"
          hint="Jika dikosongkan, sistem akan otomatis menghasilkan kata sandi sementara yang aman."
        >
          <Input
            type="text"
            maxLength={50}
            value={formData.password}
            onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
            onBlur={() => setFormData((prev) => ({ ...prev, password: prev.password.trim() }))}
            placeholder="Kosongkan untuk generate acak otomatis"
          />
        </FormField>
      )}
    </FormDialog>
  );
}
