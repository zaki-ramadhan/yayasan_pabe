"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { TurnstileWidget } from "@/components/shared/TurnstileWidget";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { stripEmojis, validateEmail } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

import { usePersistentCooldown } from "@/hooks/usePersistentCooldown";

/**
 * Modal Dialog Lupa Kata Sandi (Minimalis & Auto-Close).
 * Pola UX: Input email -> Kirim -> Modal otomatis tertutup -> Toast sukses muncul di layar.
 * Anti-Spam: Countdown 60 detik persisten via usePersistentCooldown (DRY & SSOT).
 */
export function ForgotPasswordDialog({
  isOpen,
  onOpenChange,
  initialIdentifier = "",
}) {
  const [forgotInput, setForgotInput] = useState(initialIdentifier);
  const [forgotError, setForgotError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);

  const { cooldown, startCooldown, isCoolingDown } = usePersistentCooldown(
    "pabe_pwd_reset_cooldown_until",
    60
  );

  // Inisialisasi input saat modal dibuka (React derived state pattern)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      if (initialIdentifier && initialIdentifier.includes("@")) {
        setForgotInput(
          stripEmojis(initialIdentifier).replace(/\s/g, "").slice(0, 100)
        );
      }
      setForgotError("");
    } else {
      setTurnstileToken("");
    }
  }

  useEffect(() => {
    if (!isOpen) {
      turnstileRef.current?.reset();
    }
  }, [isOpen]);

  const isInputValid = useMemo(() => {
    const clean = stripEmojis(forgotInput).trim();
    if (!clean) return false;
    return Boolean(validateEmail(clean, true).isValid);
  }, [forgotInput]);

  const handleSubmit = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (cooldown > 0 || isSubmitting) return;

    const clean = stripEmojis(forgotInput).trim().toLowerCase();
    if (!clean) {
      setForgotError("Alamat email wajib diisi.");
      toast.error("Alamat email wajib diisi.");
      return;
    }

    const emailResult = validateEmail(clean, true);
    if (!emailResult.isValid) {
      const errMsg =
        emailResult.message ||
        emailResult.error ||
        "Format alamat email tidak valid (contoh: nama@email.com).";
      setForgotError(errMsg);
      toast.error(errMsg);
      return;
    }

    setForgotError("");
    setIsSubmitting(true);
    try {
      const res = await safeFetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean, turnstileToken }),
        timeoutMs: 15000,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setTurnstileToken("");
        turnstileRef.current?.reset();
        // Jika gagal: jangan aktifkan cooldown, tetap buka modal agar user bisa perbaiki input
        throw new Error(
          data.message || "Gagal mengirimkan tautan reset kata sandi."
        );
      }

      // Berhasil: aktifkan cooldown persisten 60 detik, tampilkan toast sukses, dan tutup modal
      startCooldown(60);
      toast.success(
        data.message || "Tautan pemulihan kata sandi telah dikirim ke email Anda."
      );
      setTurnstileToken("");
      turnstileRef.current?.reset();
      onOpenChange(false);
    } catch (err) {
      setTurnstileToken("");
      turnstileRef.current?.reset();
      setForgotError(err.message || "Terjadi kendala saat mengirimkan tautan.");
      toast.error(err.message || "Terjadi kendala saat mengirimkan tautan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setForgotError("");
    setTurnstileToken("");
    turnstileRef.current?.reset();
  };

  const isSubmitDisabled = !isInputValid || isSubmitting || isCoolingDown || !turnstileToken;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-950 leading-tight">
            Atur ulang kata sandi
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
          noValidate
        >
          <div className="px-5 py-4 sm:px-6 space-y-4">
            <FormField
              label="Alamat email"
              required
              error={forgotError}
              hint={
                cooldown > 0
                  ? `Tautan telah dikirim. Anda dapat mengirim ulang dalam ${cooldown} detik.`
                  : "Masukkan email terdaftar untuk menerima tautan pemulihan kata sandi."
              }
            >
              <Input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={forgotInput}
                minLength={FIELD_LIMITS.EMAIL.min}
                maxLength={FIELD_LIMITS.EMAIL.max}
                spellCheck={false}
                autoCapitalize="none"
                disabled={isSubmitting || cooldown > 0}
                onChange={(e) => {
                  const clean = stripEmojis(e.target.value)
                    .replace(/\s/g, "")
                    .slice(0, FIELD_LIMITS.EMAIL.max);
                  setForgotInput(clean);
                  if (forgotError) {
                    const res = validateEmail(clean.trim().toLowerCase(), true);
                    if (res.isValid) setForgotError("");
                  }
                }}
                onBlur={() => {
                  const clean = stripEmojis(forgotInput).trim().toLowerCase();
                  setForgotInput(clean);
                  if (clean && !validateEmail(clean, true).isValid) {
                    setForgotError(
                      "Format alamat email tidak valid (contoh: nama@email.com)."
                    );
                  }
                }}
                className="h-10 text-sm font-normal"
              />
            </FormField>

            <FormField label="Verifikasi keamanan" htmlFor="cf-turnstile-forgot">
              <TurnstileWidget
                id="cf-turnstile-forgot"
                ref={turnstileRef}
                action="forgot_password"
                size="flexible"
                className="w-full mt-1 mb-0"
                onSuccess={(t) => setTurnstileToken(t)}
                onError={() => setTurnstileToken("")}
                onExpire={() => setTurnstileToken("")}
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
              disabled={isSubmitDisabled}
              className="h-9 px-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cooldown > 0
                ? `Tunggu ${cooldown}s`
                : isSubmitting
                ? "Mengirim..."
                : "Kirim tautan reset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
