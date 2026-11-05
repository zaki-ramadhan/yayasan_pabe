"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { PostDonationPrayerForm } from "@/components/donation/PostDonationPrayerForm";
import { saveDonorInvoice } from "@/lib/donorStorage";
import { InvoicePaymentMethod } from "@/components/invoice/InvoicePaymentMethod";
import { InvoicePaymentInstructions } from "@/components/invoice/InvoicePaymentInstructions";
import { InvoiceReceiptCard } from "@/components/invoice/InvoiceReceiptCard";
import { InvoiceActions } from "@/components/invoice/InvoiceActions";
import { DevInvoiceSandboxBar } from "@/components/invoice/DevInvoiceSandboxBar";
import { useDonationStatusPolling } from "@/hooks/useDonationStatusPolling";

export {
  InvoicePaymentMethod,
  InvoicePaymentInstructions,
  InvoiceReceiptCard,
  InvoiceActions,
  DevInvoiceSandboxBar,
};

export function InvoiceDisplay({ donation: initialDonation }) {
  const [currentStatus, setCurrentStatus] = useState(initialDonation?.status || "PENDING");
  const [paidAt, setPaidAt] = useState(initialDonation?.paidAt || null);
  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [activePrayer, setActivePrayer] = useState(initialDonation?.prayer || "");

  const [prevInitialStatus, setPrevInitialStatus] = useState(initialDonation?.status);
  const [prevInitialPaidAt, setPrevInitialPaidAt] = useState(initialDonation?.paidAt);

  if (initialDonation?.status !== prevInitialStatus) {
    setPrevInitialStatus(initialDonation?.status);
    setCurrentStatus(initialDonation?.status || "PENDING");
  }

  if (initialDonation?.paidAt !== prevInitialPaidAt) {
    setPrevInitialPaidAt(initialDonation?.paidAt);
    setPaidAt(initialDonation?.paidAt || null);
  }

  const handleStatusChange = (newStatus, newPaidAt) => {
    setCurrentStatus(newStatus);
    if (newPaidAt) {
      setPaidAt(newPaidAt);
    }
  };

  useDonationStatusPolling({
    invoiceId: initialDonation?.invoiceId,
    currentStatus,
    onStatusChange: (newStatus, newPaidAt) => {
      handleStatusChange(newStatus, newPaidAt);
      if (newStatus === "PAID" || newStatus === "SETTLEMENT") {
        toast.success("Alhamdulillah! Pembayaran donasi Anda berhasil diverifikasi.");
      } else if (newStatus === "EXPIRED") {
        toast.error("Waktu pembayaran untuk invoice ini telah kedaluwarsa.");
      } else if (newStatus === "CANCELLED") {
        toast.info("Invoice donasi ini telah dibatalkan.");
      }
    },
  });

  const donation = useMemo(
    () => ({
      ...initialDonation,
      status: currentStatus,
      paidAt: paidAt || initialDonation?.paidAt,
    }),
    [initialDonation, currentStatus, paidAt]
  );

  useEffect(() => {
    if (donation?.invoiceId) {
      saveDonorInvoice({
        invoiceId: donation.invoiceId,
        campaignSlug: donation.campaignSlug || "",
        donorName: donation.donorName,
        isAnonymous: donation.isAnonymous,
        hasPrayer: Boolean(activePrayer && activePrayer.trim()),
      });
    }
  }, [
    donation?.invoiceId,
    donation?.campaignSlug,
    donation?.donorName,
    donation?.isAnonymous,
    activePrayer,
  ]);

  // Timestamp-based countdown persistence (anti reset on refresh)
  useEffect(() => {
    if (!donation?.expiredAt || currentStatus !== "PENDING") {
      return;
    }

    const targetTime = new Date(donation.expiredAt).getTime();
    let interval = null;

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        setCurrentStatus("EXPIRED");
        if (interval) clearInterval(interval);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    if (targetTime > Date.now()) {
      interval = setInterval(updateTimer, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [donation?.expiredAt, currentStatus]);

  const effectiveTimeLeft =
    currentStatus === "PENDING"
      ? timeLeft
      : { hours: 0, minutes: 0, seconds: 0 };

  const handleCopyVa = async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedVa(true);
      toast.success("Nomor Virtual Account berhasil disalin.");
      setTimeout(() => setCopiedVa(false), 2000);
    } else {
      toast.error("Gagal menyalin nomor Virtual Account.");
    }
  };

  const handleCopyInvoiceId = async (e) => {
    const spanEl = e?.currentTarget?.querySelector?.("span");
    if (typeof window !== "undefined" && window.getSelection && spanEl) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(spanEl);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    const success = await copyToClipboard(donation?.invoiceId);
    if (success) {
      setCopiedInvoice(true);
      toast.success(`Nomor invoice ${donation?.invoiceId} berhasil disalin.`);
      setTimeout(() => setCopiedInvoice(false), 2000);
    } else {
      toast.error("Gagal menyalin nomor invoice.");
    }
  };

  const channelInfo =
    PAYMENT_CHANNELS.find((c) => c.id === donation.paymentChannelId) || PAYMENT_CHANNELS[0];

  const campaignImage = donation.campaignImage || donation.campaign?.imageUrl || "";

  const shareText = encodeURIComponent(
    `Saya baru saja berdonasi untuk "${donation.campaignTitle}" melalui Yayasan PABE. Mari bersama dukung generasi Qur'ani dan kaum dhuafa!`
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* SISI KIRI: Metode & Instruksi Pembayaran */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white rounded-xl border border-slate-300 px-5 pt-5 pb-3.5 sm:px-6 sm:pt-6 sm:pb-4 space-y-4 shadow-xs">
          <InvoicePaymentMethod
            donation={donation}
            copiedVa={copiedVa}
            onCopyVa={handleCopyVa}
            onStatusChange={handleStatusChange}
          />
          {donation.status !== "PAID" && (
            <InvoicePaymentInstructions
              channelName={donation.paymentChannelName}
              instructions={channelInfo?.instructions || []}
            />
          )}
        </div>
        {process.env.NODE_ENV === "development" && (
          <DevInvoiceSandboxBar
            donation={donation}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {/* SISI KANAN: Lembar Tagihan Donasi & Aksi */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-20">
        <InvoiceReceiptCard
          donation={donation}
          timeLeft={effectiveTimeLeft}
          copiedInvoice={copiedInvoice}
          onCopyInvoiceId={handleCopyInvoiceId}
          activePrayer={activePrayer}
          campaignImage={campaignImage}
        />

        {/* Form Titip Doa (Hanya muncul jika donasi sudah LUNAS/PAID dan belum menulis doa) */}
        {!activePrayer && donation.status === "PAID" && (
          <PostDonationPrayerForm
            invoiceId={donation.invoiceId}
            campaignSlug={donation.campaignSlug || ""}
            donorName={donation.donorName}
            defaultAnonymous={donation.isAnonymous}
            className="bg-white rounded-xl border border-slate-300 p-5 shadow-xs space-y-3"
            onSuccess={(data) => {
              setActivePrayer(data.prayer);
            }}
          />
        )}

        {/* Actions */}
        <InvoiceActions shareText={shareText} />
      </div>
    </div>
  );
}
