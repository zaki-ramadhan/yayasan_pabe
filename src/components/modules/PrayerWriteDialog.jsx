"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { AnonymousCheckbox } from "@/components/donation/AnonymousCheckbox";
import { PrayerTextarea } from "@/components/donation/PrayerTextarea";
import { sanitizePrayer, sanitizeName } from "@/lib/security";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

export function PrayerWriteDialog({
  isOpen,
  onOpenChange,
  campaignSlug = "",
  onPrayerSubmitted,
}) {
  const [donorName, setDonorName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [prayer, setPrayer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [nameError, setNameError] = useState("");

  const handlePrayerChange = (e) => {
    const clean = sanitizePrayer(e.target.value);
    if (clean.length <= 150) {
      setPrayer(clean);
      if (errorMessage) setErrorMessage("");
    }
  };

  const isFormValid = Boolean(
    prayer.trim().length > 0 &&
    !errorMessage &&
    (isAnonymous || donorName.trim().length >= 2)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanText = prayer.trim().replace(/\s+/g, " ");

    if (!cleanText) {
      setErrorMessage("Pesan doa tidak boleh kosong.");
      return;
    }

    if (!isAnonymous && !donorName.trim()) {
      setNameError("Nama wajib diisi atau pilih opsi kirim sebagai hamba Allah.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");
    setNameError("");

    try {
      const displayName = isAnonymous
        ? "Hamba Allah"
        : (donorName.trim() || "Hamba Allah");

      const newPrayerItem = {
        id: `prayer-${Date.now()}`,
        name: displayName,
        prayer: cleanText,
        amount: 0,
        date: new Date().toISOString(),
        aminCount: 0,
        isAnonymous,
      };

      if (onPrayerSubmitted) {
        onPrayerSubmitted(newPrayerItem);
      }

      toast.success("Doa kebaikan Anda berhasil dikirim.");
      setPrayer("");
      setDonorName("");
      setIsAnonymous(false);
      onOpenChange(false);
    } catch {
      setErrorMessage("Terjadi kendala saat mengirim doa. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-950 leading-tight">
            Titipkan doa kebaikan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-4">
            {/* Input Nama Donatur / Pengirim */}
            <div className="space-y-1.5">
              <FormField label="Nama Anda" error={nameError}>
                <Input
                  id="prayer-donor-name"
                  type="text"
                  autoComplete="name"
                  disabled={isAnonymous}
                  placeholder={isAnonymous ? "Hamba Allah" : "Nama lengkap / panggilan"}
                  value={donorName}
                  onChange={(e) => {
                    setDonorName(sanitizeName(e.target.value));
                    if (nameError) setNameError("");
                  }}
                  onBlur={() => setDonorName((prev) => prev.trim())}
                  className="h-9 text-xs sm:text-sm"
                  maxLength={40}
                />
              </FormField>

              {/* Opsi Anonim */}
              <AnonymousCheckbox
                id="prayer-anonymous-checkbox"
                checked={isAnonymous}
                onChange={(checked) => {
                  setIsAnonymous(checked);
                  if (checked && nameError) setNameError("");
                }}
                variant="inline"
                className="pt-0.5"
              />
            </div>

            {/* Input Pesan Doa */}
            <PrayerTextarea
              id="prayer-message-text"
              value={prayer}
              onChange={handlePrayerChange}
              error={errorMessage}
              placeholder="Tuliskan doa terbaik untuk saudara kita yang membutuhkan..."
            />
          </div>

          {/* Aksi Kirim (Fixed Footer) */}
          <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex flex-col gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-9 text-xs sm:text-sm font-medium bg-primary hover:bg-primary-hover text-white cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? "Mengirim doa..." : "Kirimkan doa"}</span>
            </Button>

            {/* Subtle callout to donate */}
            {campaignSlug && (
              <p className="text-center text-xs text-slate-500">
                Ingin sekaligus berdonasi?{" "}
                <Link
                  href={`/campaign/${campaignSlug}/donate`}
                  className="font-medium text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Salurkan donasi sekarang
                </Link>
              </p>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
