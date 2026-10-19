/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { formatRupiah } from "@/lib/formatters";
import {
  DONATION_LIMITS,
  generateIdempotencyKey,
  validateName,
  validatePhone,
  validateEmail,
  sanitizePrayer,
  sanitizePhone,
} from "@/lib/security";
import { getStoredUser } from "@/services/authService";
import { saveDonationDraft, loadDonationDraft, clearDonationDraft } from "@/lib/donationDraft";
import { saveDonorInvoice } from "@/lib/donorStorage";
import { safeFetch } from "@/lib/safeFetch";
import { NominalPresetsPicker } from "@/components/donation/NominalPresetsPicker";
import { PaymentChannelPicker } from "@/components/donation/PaymentChannelPicker";
import { DonorIdentitySection } from "@/components/donation/DonorIdentitySection";
import { DonationCheckoutSummary } from "@/components/donation/DonationCheckoutSummary";

const NOMINAL_PRESETS = [25000, 50000, 100000, 250000, 500000];

function subscribePrayers(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}
function getPrayersSnapshot() {
  return localStorage.getItem("pabe_user_prayers") || localStorage.getItem("ygsm_user_prayers") || "[]";
}
function getPrayersServerSnapshot() {
  return "[]";
}

export function DonationCheckoutForm({ campaign, initialAmount = 50000, initialPrayer = "" }) {
  const router = useRouter();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const isPresetInitial = NOMINAL_PRESETS.includes(initialAmount);
  const [isCustomMode, setIsCustomMode] = useState(!isPresetInitial);
  const [amount, setAmount] = useState(initialAmount);
  const [customAmountInput, setCustomAmountInput] = useState(
    isPresetInitial ? "" : initialAmount.toString()
  );
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [prayer, setPrayer] = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlPrayer = sp.get("prayer");
      if (urlPrayer) return sanitizePrayer(urlPrayer.trim()).slice(0, 150);
    }
    return initialPrayer ? sanitizePrayer(initialPrayer.trim()).slice(0, 150) : "";
  });
  const [selectedChannelId, setSelectedChannelId] = useState("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialPrayer) {
      setPrayer(sanitizePrayer(initialPrayer.trim()).slice(0, 150));
    } else if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlPrayer = sp.get("prayer");
      if (urlPrayer) {
        setPrayer(sanitizePrayer(urlPrayer.trim()).slice(0, 150));
      }
    }
  }, [initialPrayer]);

  useEffect(() => {
    const initSessionAndDraft = async () => {
      const user = getStoredUser();
      if (!user) {
        // Simpan draft sebelum redirect agar form bisa di-restore setelah login
        const currentUrl =
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : `/campaign/${campaign?.slug}/donate`;
        const queryPrayer =
          typeof window !== "undefined"
            ? new URLSearchParams(window.location.search).get("prayer")
            : "";
        const effectivePrayer = prayer || initialPrayer || queryPrayer || "";
        saveDonationDraft(campaign?.slug, {
          amount,
          isCustomMode,
          customAmountInput,
          isAnonymous,
          donorName,
          donorPhone,
          donorEmail,
          prayer: effectivePrayer,
          selectedChannelId,
        });
        router.replace(
          `/login?redirect=${encodeURIComponent(currentUrl)}&reason=donation_requires_login`
        );
        return;
      }

      // Cek apakah ada draft yang disimpan (user baru kembali dari login)
      const draft = loadDonationDraft(campaign?.slug);
      if (draft) {
        if (draft.amount && draft.amount > 0) {
          setAmount(draft.amount);
          setIsCustomMode(draft.isCustomMode ?? false);
          setCustomAmountInput(draft.customAmountInput ?? "");
        }
        if (draft.isAnonymous !== undefined) setIsAnonymous(draft.isAnonymous);
        const hasFreshPrayer = Boolean(
          initialPrayer ||
          (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("prayer"))
        );
        if (draft.prayer && !hasFreshPrayer) {
          setPrayer(draft.prayer);
        }
        if (draft.selectedChannelId) setSelectedChannelId(draft.selectedChannelId);
        // Identitas donatur dari draft hanya jika user belum ada datanya
        if (draft.donorPhone) setDonorPhone(draft.donorPhone);
        clearDonationDraft();
      }

      // Selalu isi nama & email dari profil user (lebih terpercaya dari draft)
      if (user.name && user.name !== "Pengguna Google" && user.name !== "Pengguna Facebook") {
        setDonorName(user.name);
      }
      if (user.email && !user.email.endsWith("@google.user") && !user.email.endsWith("@facebook.user")) {
        setDonorEmail(user.email);
      }
      if (user.phone && user.phone !== "-") {
        const cleanPhone = sanitizePhone(user.phone);
        if (cleanPhone) {
          setDonorPhone(cleanPhone);
        }
      }

      setIsAuthChecking(false);
    };

    initSessionAndDraft();
  }, [campaign?.slug, router]); // eslint-disable-line react-hooks/exhaustive-deps

  const prayersRaw = useSyncExternalStore(subscribePrayers, getPrayersSnapshot, getPrayersServerSnapshot);
  let hasExistingPrayer = false;
  try {
    const storedPrayers = JSON.parse(prayersRaw);
    hasExistingPrayer = Boolean(campaign?.slug && Array.isArray(storedPrayers) && storedPrayers.includes(campaign.slug));
  } catch {
    hasExistingPrayer = false;
  }

  if (isAuthChecking) {
    return (
      <div className="bg-white rounded-xl border border-slate-300 p-10 text-center space-y-3 max-w-lg mx-auto">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-700">Memverifikasi sesi masuk donatur...</p>
      </div>
    );
  }

  const handlePresetClick = (val) => {
    setIsCustomMode(false);
    setAmount(val);
    setCustomAmountInput("");
  };

  const handleCustomModeClick = () => {
    setIsCustomMode(true);
    const num = Number(customAmountInput);
    setAmount(num || 0);
  };

  const handleCustomInputChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 9);
    const num = Number(rawVal);
    const clamped = Math.min(num, DONATION_LIMITS.MAX_AMOUNT);
    const finalRaw = clamped > 0 ? String(clamped) : (rawVal === "" ? "" : "0");
    setCustomAmountInput(finalRaw);
    setAmount(clamped);
  };

  const handlePrayerChange = (e) => {
    const clean = sanitizePrayer(e.target.value);
    if (clean.length <= 150) {
      setPrayer(clean);
    }
  };

  const selectedChannel = PAYMENT_CHANNELS.find((c) => c.id === selectedChannelId) || PAYMENT_CHANNELS[0];
  const adminFee = selectedChannel.fee || 0;
  const totalPayment = amount + adminFee;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (amount < DONATION_LIMITS.MIN_AMOUNT) {
      toast.error(`Nominal donasi minimal ${formatRupiah(DONATION_LIMITS.MIN_AMOUNT)}`);
      return;
    }
    if (amount > DONATION_LIMITS.MAX_AMOUNT) {
      toast.error(`Nominal donasi maksimal ${formatRupiah(DONATION_LIMITS.MAX_AMOUNT)}`);
      return;
    }

    const nameVal = validateName(donorName, isAnonymous);
    if (!nameVal.isValid) {
      toast.error(nameVal.message);
      return;
    }

    const phoneVal = validatePhone(donorPhone);
    if (!phoneVal.isValid) {
      toast.error(phoneVal.message);
      return;
    }

    if (donorEmail) {
      const emailVal = validateEmail(donorEmail);
      if (!emailVal.isValid) {
        toast.error(emailVal.message);
        return;
      }
    }

    try {
      setIsSubmitting(true);
      const idempotencyKey = generateIdempotencyKey();
      const sanitizedPrayer = prayer.trim().replace(/\s+/g, " ");

      const res = await safeFetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign?.id || null,
          campaignTitle: campaign?.title || "Sedekah Umum PABE",
          campaignSlug: campaign?.slug || "",
          donationType: "CAMPAIGN",
          amount,
          paymentChannelId: selectedChannelId,
          donorName: isAnonymous ? "Hamba Allah" : donorName.trim(),
          donorEmail: donorEmail.trim(),
          donorPhone: donorPhone.trim(),
          isAnonymous,
          prayer: sanitizedPrayer,
          idempotencyKey,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal memproses donasi.");
      }

      const donation = json.data;

      saveDonorInvoice({
        invoiceId: donation.invoiceId,
        token: donation.accessToken || "",
        campaignSlug: campaign?.slug || "",
        donorName: donation.donorName,
        isAnonymous,
        hasPrayer: Boolean(sanitizedPrayer),
      });

      clearDonationDraft();
      toast.success("Tagihan donasi berhasil dibuat!");
      const targetUrl = donation.accessToken
        ? `/invoice/${donation.invoiceId}?token=${donation.accessToken}`
        : `/invoice/${donation.invoiceId}`;
      router.push(targetUrl);
    } catch (err) {
      toast.error(err.message || "Gagal memproses transaksi. Silakan coba kembali.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* LEFT COLUMN: Steps */}
      <div className="lg:col-span-7 space-y-6">
        <NominalPresetsPicker
          presets={NOMINAL_PRESETS}
          amount={amount}
          isCustomMode={isCustomMode}
          customAmountInput={customAmountInput}
          onPresetClick={handlePresetClick}
          onCustomModeClick={handleCustomModeClick}
          onCustomInputChange={handleCustomInputChange}
        />

        <PaymentChannelPicker
          channels={PAYMENT_CHANNELS}
          selectedChannelId={selectedChannelId}
          onSelectChannel={setSelectedChannelId}
        />

        <DonorIdentitySection
          isAnonymous={isAnonymous}
          setIsAnonymous={setIsAnonymous}
          donorName={donorName}
          setDonorName={setDonorName}
          donorPhone={donorPhone}
          setDonorPhone={setDonorPhone}
          donorEmail={donorEmail}
          setDonorEmail={setDonorEmail}
          prayer={prayer}
          setPrayer={setPrayer}
          onPrayerChange={handlePrayerChange}
          hasExistingPrayer={hasExistingPrayer}
        />
      </div>

      {/* RIGHT COLUMN: Preview & Summary */}
      <DonationCheckoutSummary
        campaign={campaign}
        amount={amount}
        selectedChannel={selectedChannel}
        adminFee={adminFee}
        totalPayment={totalPayment}
        isSubmitting={isSubmitting}
      />
    </form>
  );
}
