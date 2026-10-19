"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { sanitizeInput } from "@/lib/security";

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

  if (!job) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

    if (!fullNameTrimmed || fullNameTrimmed.length < 2) {
      toast.error("Nama lengkap wajib diisi minimal 2 karakter.");
      return;
    }
    if (!emailTrimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      toast.error("Format email tidak valid.");
      return;
    }
    if (phoneTrimmed.length < 10) {
      toast.error("Nomor WhatsApp/HP minimal 10 digit angka.");
      return;
    }
    if (!formData.resumeUrl.trim()) {
      toast.error("Tautan resume / CV (Google Drive/PDF) wajib dicantumkan.");
      return;
    }
    if (coverLetterTrimmed.length < 10) {
      toast.error("Surat pengantar wajib diisi minimal 10 karakter.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/careers/apply", {
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
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Gagal mengirimkan lamaran.");
      }

      setIsSuccess(true);
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
      <DialogContent className="max-w-lg p-5 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">
            {isSuccess ? "Lamaran Berhasil Terkirim" : "Formulir Lamaran Kerja"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isSuccess
              ? "Data berkas Anda telah tersimpan secara resmi di database yayasan."
              : `Mengajukan lamaran untuk posisi ${job.title} (${job.department})`}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              Jazakumullahu Khairan
            </h3>
            <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
              Lamaran Anda untuk posisi <strong>{job.title}</strong> telah berhasil kami terima.
              Tim rekrutmen akan meninjau kualifikasi Anda dan menghubungi via WhatsApp atau email.
            </p>
            <Button
              type="button"
              onClick={handleClose}
              className="mt-4 bg-primary hover:bg-primary-hover text-white text-xs h-9 px-6 rounded-lg font-medium"
            >
              Tutup &amp; Selesai
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
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
                  onChange={(e) => handleChange("fullName", e.target.value)}
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
                  onChange={(e) => handleChange("email", e.target.value)}
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
                  onChange={handlePhoneChange}
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
                  onChange={(e) => handleChange("linkedinUrl", e.target.value)}
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
                onChange={(e) => handleChange("resumeUrl", e.target.value)}
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
                onChange={(e) => handleChange("coverLetter", e.target.value)}
                rows={3}
                required
                className="text-xs resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="h-9 text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="h-9 text-xs bg-primary hover:bg-primary-hover text-white font-medium px-4"
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
