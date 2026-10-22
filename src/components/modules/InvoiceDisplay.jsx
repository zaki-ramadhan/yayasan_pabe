"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { CAMPAIGNS } from "@/data/campaigns";
import { PostDonationPrayerForm } from "@/components/donation/PostDonationPrayerForm";
import { saveDonorInvoice } from "@/lib/donorStorage";
import { InvoicePaymentMethod } from "@/components/invoice/InvoicePaymentMethod";
import { InvoicePaymentInstructions } from "@/components/invoice/InvoicePaymentInstructions";
import { InvoiceReceiptCard } from "@/components/invoice/InvoiceReceiptCard";
import { InvoiceActions } from "@/components/invoice/InvoiceActions";

export {
  InvoicePaymentMethod,
  InvoicePaymentInstructions,
  InvoiceReceiptCard,
  InvoiceActions,
};

export function InvoiceDisplay({ donation }) {
  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 59, seconds: 59 });
  const [activePrayer, setActivePrayer] = useState(donation?.prayer || "");

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
  }, [donation, activePrayer]);

  // Timestamp-based countdown persistence (anti reset on refresh)
  useEffect(() => {
    if (!donation?.expiredAt) return;

    const targetTime = new Date(donation.expiredAt).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [donation?.expiredAt]);

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

  const matchedCampaign = CAMPAIGNS.find(
    (c) => c.slug === donation.campaignSlug || c.title === donation.campaignTitle
  );
  const campaignImage = donation.campaignImage || matchedCampaign?.bannerUrl;

  const shareText = encodeURIComponent(
    `Saya baru saja berdonasi untuk "${donation.campaignTitle}" melalui Yayasan PABE. Mari bersama dukung generasi Qur'ani dan kaum dhuafa!`
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* SISI KIRI: Metode & Instruksi Pembayaran */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-xl border border-slate-300 p-5 sm:p-6 space-y-5 shadow-xs">
          <InvoicePaymentMethod
            donation={donation}
            copiedVa={copiedVa}
            onCopyVa={handleCopyVa}
          />
          <InvoicePaymentInstructions
            channelName={donation.paymentChannelName}
            instructions={channelInfo?.instructions || []}
          />
        </div>
      </div>

      {/* SISI KANAN: Lembar Tagihan Donasi & Aksi */}
      <div className="lg:col-span-5 space-y-5">
        <InvoiceReceiptCard
          donation={donation}
          timeLeft={timeLeft}
          copiedInvoice={copiedInvoice}
          onCopyInvoiceId={handleCopyInvoiceId}
          activePrayer={activePrayer}
          campaignImage={campaignImage}
        />

        {/* Form Titip Doa (Hanya muncul jika belum menulis doa, dan hilang seketika setelah submit) */}
        {!activePrayer && (
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
