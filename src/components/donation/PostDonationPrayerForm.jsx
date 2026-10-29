"use client";

import { useState } from "react";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { AnonymousCheckbox } from "@/components/donation/AnonymousCheckbox";
import { PrayerTextarea } from "@/components/donation/PrayerTextarea";
import { sanitizePrayer } from "@/lib/security";
import { markPrayerSubmitted } from "@/lib/donorStorage";
import { safeFetch } from "@/lib/safeFetch";
import { cn } from "@/lib/utils";

export function PostDonationPrayerForm({
  invoiceId,
  campaignSlug = "",
  donorName = "Donatur",
  defaultAnonymous = false,
  onSuccess,
  className,
}) {
  const [prayer, setPrayer] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(defaultAnonymous);
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

    const cleanPrayer = prayer.trim().replace(/\s+/g, " ");
    if (!cleanPrayer) {
      setErrorMessage("Pesan doa tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const res = await safeFetch("/api/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          prayer: cleanPrayer,
          isAnonymous,
        }),
        timeoutMs: 12000,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal menyimpan doa.");
      }

      markPrayerSubmitted(campaignSlug, invoiceId);
      toast.success("Doa kebaikan Anda berhasil dikirim.");

      if (onSuccess) {
        onSuccess(json.data);
      }
    } catch (err) {
      setErrorMessage(err.message || "Terjadi kendala saat mengirim doa. Silakan coba lagi.");
      toast.error(err.message || "Gagal menyimpan doa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn("p-5 sm:p-6 bg-slate-50 border border-slate-300 rounded-xl space-y-4", className)}>
      <div className="space-y-0.5">
        <h3 className="font-semibold text-slate-900 text-sm">
          Titipkan Doa Kebaikan
        </h3>
        <p className="text-xs text-slate-500">
          Untaian doa Anda akan dicantumkan di halaman program untuk diaminkan bersama donatur lainnya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <PrayerTextarea
          id={`prayer-input-${invoiceId}`}
          rows={2}
          value={prayer}
          onChange={handlePrayerChange}
          error={errorMessage}
        />

        <AnonymousCheckbox
          id={`prayer-anonymous-${invoiceId}`}
          checked={isAnonymous}
          onChange={setIsAnonymous}
          variant="inline"
        />

        <div className="flex justify-end pt-0.5">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={isSubmitting}
            className="text-xs px-3.5 py-1.5 h-auto rounded-lg font-medium cursor-pointer"
          >
            {isSubmitting ? "Mengirim..." : "Kirim Doa"}
          </Button>
        </div>
      </form>
    </div>
  );
}
