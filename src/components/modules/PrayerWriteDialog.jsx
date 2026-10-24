"use client";

import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnonymousCheckbox } from "@/components/donation/AnonymousCheckbox";
import { PrayerTextarea } from "@/components/donation/PrayerTextarea";
import { sanitizePrayer } from "@/lib/security";
import { toast } from "@/hooks/use-toast";
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

  const handlePrayerChange = (e) => {
    const clean = sanitizePrayer(e.target.value);
    if (clean.length <= 150) {
      setPrayer(clean);
      if (errorMessage) setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanText = prayer.trim().replace(/\s+/g, " ");

    if (!cleanText) {
      setErrorMessage("Pesan doa tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

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
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-950 leading-tight">
            Titipkan Doa Kebaikan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-4">
            {/* Input Nama Donatur / Pengirim */}
            <div className="space-y-1.5">
              <label htmlFor="prayer-donor-name" className="text-xs font-medium text-slate-800">
                Nama Anda
              </label>
              <Input
                id="prayer-donor-name"
                type="text"
                autoComplete="name"
                disabled={isAnonymous}
                placeholder={isAnonymous ? "Hamba Allah" : "Nama lengkap / panggilan"}
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="h-9 text-xs sm:text-sm"
                maxLength={40}
              />

              {/* Opsi Anonim */}
              <AnonymousCheckbox
                id="prayer-anonymous-checkbox"
                checked={isAnonymous}
                onChange={setIsAnonymous}
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
              disabled={isSubmitting || !prayer.trim()}
              className="w-full h-9 text-xs sm:text-sm font-medium bg-primary hover:bg-primary-hover text-white gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? "Mengirim Doa..." : "Kirimkan Doa"}</span>
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
