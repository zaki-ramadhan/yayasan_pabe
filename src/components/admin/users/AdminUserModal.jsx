/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { FormDialog } from "@/components/ui/FormDialog";
import { USER_ROLES } from "@/services/authService";
import { validateEmail, validatePhone } from "@/lib/validator";
import { isFormDirty } from "@/lib/formUtils";
import { isInfrastructureEmail } from "@/lib/infrastructureConstants";
import { AdminUserProfileFields } from "./AdminUserProfileFields";
import { AdminUserAccessFields } from "./AdminUserAccessFields";

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

      <AdminUserProfileFields
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        isEdit={isEdit}
      />

      <AdminUserAccessFields
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        setErrors={setErrors}
        canAssignSuperAdmin={canAssignSuperAdmin}
        isEdit={isEdit}
      />
    </FormDialog>
  );
}
