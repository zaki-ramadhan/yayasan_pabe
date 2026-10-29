"use client";

import { useState, useMemo } from "react";
import { CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";
import { stripEmojis, validateEmail, validatePhone } from "@/lib/security";

export function ForgotPasswordDialog({ isOpen, onOpenChange, initialIdentifier = "" }) {
  const [forgotInput, setForgotInput] = useState(initialIdentifier);
  const [forgotError, setForgotError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const isInputValid = useMemo(() => {
    const clean = stripEmojis(forgotInput).trim();
    if (!clean) return false;
    if (clean.includes("@")) {
      return Boolean(validateEmail(clean, true).isValid);
    }
    return Boolean(validatePhone(clean).isValid);
  }, [forgotInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = stripEmojis(forgotInput).trim();
    if (!clean) {
      setForgotError("Email atau nomor WhatsApp wajib diisi.");
      toast.error("Email atau nomor WhatsApp wajib diisi.");
      return;
    }

    if (clean.includes("@")) {
      const emailResult = validateEmail(clean, true);
      if (!emailResult.valid) {
        setForgotError(emailResult.error);
        toast.error(emailResult.error);
        return;
      }
    } else {
      const phoneResult = validatePhone(clean);
      if (!phoneResult.valid) {
        setForgotError("Format email atau nomor WhatsApp tidak valid (contoh: 081234567890).");
        toast.error("Format email atau nomor WhatsApp tidak valid (contoh: 081234567890).");
        return;
      }
    }

    setForgotError("");
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setForgotSent(true);
      toast.success("Tautan instruksi pemulihan telah dikirimkan!");
    }, 800);
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setForgotSent(false);
      setForgotError("");
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-950 leading-tight">
            Atur Ulang Kata Sandi
          </DialogTitle>
        </DialogHeader>

        {forgotSent ? (
          <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-950">Instruksi Berhasil Dikirim</h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Tautan verifikasi reset kata sandi telah dikirimkan ke <strong>{forgotInput}</strong>. Silakan periksa inbox email atau pesan WhatsApp Anda.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleClose}
              className="w-full h-10 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg mt-2 cursor-pointer"
            >
              Selesai &amp; Tutup
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden" noValidate>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-4">
              <FormField
                label="Email atau nomor WhatsApp"
                required
                error={forgotError}
              >
                <Input
                  type="text"
                  placeholder="nama@email.com atau 081234567890"
                  value={forgotInput}
                  maxLength={100}
                  spellCheck={false}
                  autoCapitalize="none"
                  onChange={(e) => {
                    const clean = stripEmojis(e.target.value)
                      .replace(/\s/g, "")
                      .slice(0, 100);
                    setForgotInput(clean);
                    if (forgotError) setForgotError("");
                  }}
                  onBlur={() => setForgotInput((prev) => prev.trim())}
                  className="h-10 text-sm font-normal"
                />
              </FormField>
            </div>

            <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="h-9 px-4 text-sm font-medium border-slate-300 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={!isInputValid || isSubmitting}
                className="h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Tautan Reset"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
