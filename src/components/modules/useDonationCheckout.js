"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
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
import { toast } from "@/hooks/use-toast";

export const NOMINAL_PRESETS = [25000, 50000, 100000, 250000, 500000];

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

export function useDonationCheckout({ campaign, initialAmount = 50000, initialPrayer = "" }) {
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
        if (draft.donorPhone) setDonorPhone(draft.donorPhone);
        clearDonationDraft();
      }

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

  return {
    isAuthChecking,
    amount,
    isCustomMode,
    customAmountInput,
    isAnonymous,
    setIsAnonymous,
    donorName,
    setDonorName,
    donorPhone,
    setDonorPhone,
    donorEmail,
    setDonorEmail,
    prayer,
    setPrayer,
    selectedChannelId,
    setSelectedChannelId,
    isSubmitting,
    hasExistingPrayer,
    selectedChannel,
    adminFee,
    totalPayment,
    handlePresetClick,
    handleCustomModeClick,
    handleCustomInputChange,
    handlePrayerChange,
    handleSubmit,
  };
}
