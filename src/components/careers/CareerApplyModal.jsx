/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useMemo } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { CareerApplySuccessState } from "./CareerApplySuccessState";
import { CareerApplyFormFields } from "./CareerApplyFormFields";
import { sanitizeInput, sanitizeName, sanitizePhone, sanitizeEmail } from "@/lib/security";
import { validateEmail, validatePhone } from "@/lib/validator";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { getStoredUser } from "@/services/authService";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useStagedUploads } from "@/hooks/useStagedUploads";

export function CareerApplyModal({ isOpen, onClose, job }) {
  const { currentUser } = useCurrentUser();
  const storedUser = getStoredUser();
  const activeUser = currentUser || storedUser;

  const isNameLocked = Boolean(
    activeUser?.name &&
    activeUser.name !== "Pengguna Google" &&
    activeUser.name !== "Pengguna Facebook"
  );

  const isEmailLocked = Boolean(
    activeUser?.email &&
    !activeUser.email.endsWith("@google.user") &&
    !activeUser.email.endsWith("@facebook.user")
  );

  const requiresResume = job.requiresResume !== false && job.applyUrl !== "WITHOUT_RESUME";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    resumeUrl: "",
    coverLetter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const { trackUpload, commitUploads, discardUploads } = useStagedUploads();

  const handleClose = () => {
    if (!isSuccess) {
      discardUploads();
    }
    onClose();
  };

  // Restore draft and prefill logged in user when modal opens (mirip form relawan)
  useEffect(() => {
    if (!isOpen || !job?.id) return;
    try {
      const saved = sessionStorage.getItem(`career_draft_${job.id}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") {
          setFormData((prev) => ({ ...prev, ...parsed }));
        }
      }
    } catch {}

    if (activeUser) {
      setFormData((prev) => ({
        ...prev,
        fullName: isNameLocked
          ? activeUser.name
          : prev.fullName || (activeUser.name && activeUser.name !== "Pengguna Google" && activeUser.name !== "Pengguna Facebook" ? activeUser.name : ""),
        email: isEmailLocked
          ? activeUser.email
          : prev.email || (activeUser.email && !activeUser.email.endsWith("@google.user") && !activeUser.email.endsWith("@facebook.user") ? activeUser.email : ""),
        phone: prev.phone || (activeUser.phone && activeUser.phone !== "-" ? sanitizePhone(activeUser.phone) : ""),
      }));
    }
  }, [isOpen, job?.id, activeUser, isNameLocked, isEmailLocked]);

  // Auto-save draft on input
  useEffect(() => {
    if (!job?.id) return;
    try {
      if (formData.fullName || formData.email || formData.phone || formData.coverLetter) {
        sessionStorage.setItem(`career_draft_${job.id}`, JSON.stringify(formData));
      }
    } catch {}
  }, [formData, job?.id]);

  const isFormValid = useMemo(() => {
    const isNameOk = formData.fullName.trim().length >= 2;
    const isEmailOk = validateEmail(formData.email.trim(), true).isValid;
    const isPhoneOk = validatePhone(formData.phone.trim()).isValid;
    const isResumeOk = !requiresResume || formData.resumeUrl.trim().length > 0;
    const isCoverOk = formData.coverLetter.trim().length >= 10;
    return Boolean(isNameOk && isEmailOk && isPhoneOk && isResumeOk && isCoverOk);
  }, [formData, requiresResume]);

  if (!job) return null;

  const handleChange = (field, value) => {
    let cleanValue = value;
    if (field === "fullName") cleanValue = sanitizeName(value);
    else if (field === "email") cleanValue = sanitizeEmail(value);
    else if (field === "phone") cleanValue = sanitizePhone(value);
    else if (field === "resumeUrl") {
      cleanValue = (value || "").replace(/\s+/g, "").slice(0, 300);
      if (cleanValue) trackUpload(cleanValue);
    }
    else if (field === "coverLetter") cleanValue = value.replace(/^\s+/, "").replace(/\s{2,}/g, " ").slice(0, 500);

    setFormData((prev) => ({
      ...prev,
      [field]: cleanValue,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field) => () => {
    setFormData((prev) => {
      const val = prev[field];
      if (typeof val !== "string") return prev;
      return { ...prev, [field]: val.trim() };
    });
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const cleanDigits = sanitizePhone(raw);
    handleChange("phone", cleanDigits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fullNameTrimmed = sanitizeInput(formData.fullName.trim());
    const emailTrimmed = formData.email.trim();
    const phoneTrimmed = formData.phone.trim();
    const coverLetterTrimmed = sanitizeInput(formData.coverLetter.trim());

    const newErrors = {};
    if (!fullNameTrimmed || fullNameTrimmed.length < 2) {
      newErrors.fullName = "Nama lengkap wajib diisi minimal 2 karakter.";
    }
    const emailValidation = validateEmail(emailTrimmed, true);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message || "Format alamat email tidak valid.";
    }
    const phoneValidation = validatePhone(phoneTrimmed, { fieldName: "Nomor WhatsApp" });
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.message;
    }
    const hasResume = formData.resumeUrl instanceof File || (typeof formData.resumeUrl === "string" && Boolean(formData.resumeUrl.trim()));
    if (requiresResume && !hasResume) {
      newErrors.resumeUrl = "Berkas CV / resume (PDF) wajib diunggah untuk posisi ini.";
    }
    if (coverLetterTrimmed.length < 10) {
      newErrors.coverLetter = "Motivasi bergabung wajib diisi minimal 10 karakter.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    try {
      const response = await safeFetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vacancyId: job.id,
          fullName: fullNameTrimmed,
          email: emailTrimmed,
          phone: phoneValidation.sanitized,
          resumeUrl: formData.resumeUrl.trim(),
          coverLetter: coverLetterTrimmed,
        }),
        timeoutMs: 15000,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengirimkan lamaran.");
      }

      commitUploads();
      setIsSuccess(true);
      try {
        sessionStorage.removeItem(`career_draft_${job.id}`);
      } catch {}
      toast.success("Lamaran berhasil dikirim. Tim kami akan segera meninjaunya.");
    } catch (error) {
      toast.error(error.message || "Terjadi kendala saat mengirimkan lamaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            {isSuccess ? "Lamaran Berhasil Terkirim" : "Formulir Lamaran Kerja"}
          </DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-6 sm:px-6">
            <CareerApplySuccessState job={job} onClose={handleClose} />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-4">
              <CareerApplyFormFields
                job={job}
                formData={formData}
                onChange={handleChange}
                onBlur={handleBlur}
                onPhoneChange={handlePhoneChange}
                isNameLocked={isNameLocked}
                isEmailLocked={isEmailLocked}
                requiresResume={requiresResume}
                errors={errors}
              />
            </div>

            <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-10 text-sm font-medium cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 text-sm bg-primary hover:bg-primary-hover text-white font-medium px-4 cursor-pointer gap-1.5 disabled:pointer-events-none disabled:cursor-not-allowed"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                <span>{isSubmitting ? "Mengirimkan..." : "Kirim Lamaran"}</span>
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
