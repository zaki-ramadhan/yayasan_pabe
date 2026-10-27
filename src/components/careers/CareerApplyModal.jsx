/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CareerApplySuccessState } from "./CareerApplySuccessState";
import { CareerApplyFormFields } from "./CareerApplyFormFields";
import { sanitizeInput } from "@/lib/security";
import { validateEmail } from "@/lib/validator";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";
import { getStoredUser } from "@/services/authService";

export function CareerApplyModal({ isOpen, onClose, job }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    linkedinUrl: "",
    resumeUrl: "",
    coverLetter: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [errors, setErrors] = useState({});

  // Restore draft and prefill logged in user when modal opens
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

    const user = getStoredUser();
    if (user?.email && !user.email.endsWith("@google.user") && !user.email.endsWith("@facebook.user")) {
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        fullName: prev.fullName || (user.name && user.name !== "Pengguna Google" && user.name !== "Pengguna Facebook" ? user.name : ""),
        phone: prev.phone || (user.phone && user.phone !== "-" ? user.phone : ""),
      }));
      setIsEmailLocked(true);
    }
  }, [isOpen, job?.id]);

  // Auto-save draft on input
  useEffect(() => {
    if (!job?.id) return;
    try {
      if (formData.fullName || formData.email || formData.phone || formData.coverLetter) {
        sessionStorage.setItem(`career_draft_${job.id}`, JSON.stringify(formData));
      }
    } catch {}
  }, [formData, job?.id]);

  if (!job) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const cleanDigits = raw.replace(/\D/g, "").slice(0, 15);
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
    if (phoneTrimmed.length < 10) {
      newErrors.phone = "Nomor WhatsApp/HP minimal 10 digit angka.";
    }
    if (!formData.resumeUrl.trim()) {
      newErrors.resumeUrl = "Tautan resume / CV (Google Drive/PDF) wajib dicantumkan.";
    }
    if (coverLetterTrimmed.length < 10) {
      newErrors.coverLetter = "Surat pengantar wajib diisi minimal 10 karakter.";
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
          phone: phoneTrimmed,
          linkedinUrl: formData.linkedinUrl.trim(),
          resumeUrl: formData.resumeUrl.trim(),
          coverLetter: coverLetterTrimmed,
        }),
        timeoutMs: 15000,
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengirimkan lamaran.");
      }

      setIsSuccess(true);
      try {
        sessionStorage.removeItem(`career_draft_${job.id}`);
      } catch {}
      toast.success("Lamaran berhasil dikirim ke database HRD!");
    } catch (error) {
      toast.error(error.message || "Terjadi kendala saat mengirimkan lamaran.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsSuccess(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        linkedinUrl: "",
        resumeUrl: "",
        coverLetter: "",
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
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
                onPhoneChange={handlePhoneChange}
                isEmailLocked={isEmailLocked}
                errors={errors}
              />
            </div>

            <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-9 text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 text-xs bg-primary hover:bg-primary-hover text-white font-medium px-4 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Mengirimkan...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Kirim Lamaran
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
