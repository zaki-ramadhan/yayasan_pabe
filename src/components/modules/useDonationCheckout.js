/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useSyncExternalStore, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { getPaymentChannelLimits } from "@/data/transactionLimits";
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
import { getStoredUser, loginUser } from "@/services/authService";
import { saveDonationDraft, loadDonationDraft, clearDonationDraft } from "@/lib/donationDraft";
import { saveDonorInvoice } from "@/lib/donorStorage";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

export const NOMINAL_PRESETS = [25000, 50000, 100000, 250000, 500000];

function subscribePrayers(callback) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getPrayersSnapshot() {
  return localStorage.getItem("pabe_user_prayers") || "[]";
}

function getPrayersServerSnapshot() {
  return "[]";
}

export function useDonationCheckout({ campaign, initialAmount = 50000, initialPrayer = "" }) {
  const router = useRouter();
  const isSubmittingRef = useRef(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  const isZakat = useMemo(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const queryType = sp.get("type") || sp.get("donationType");
      if (queryType && queryType.toUpperCase() === "ZAKAT") return true;
    }
    return Boolean(
      campaign?.slug === "zakat" ||
      campaign?.categoryId === "zakat" ||
      campaign?.categorySlug === "zakat" ||
      (typeof campaign?.title === "string" && campaign.title.toLowerCase().includes("zakat"))
    );
  }, [campaign]);

  const isPresetInitial = NOMINAL_PRESETS.includes(initialAmount);
  const [isCustomMode, setIsCustomMode] = useState(!isPresetInitial);
  const [amount, setAmount] = useState(initialAmount);
  const [customAmountInput, setCustomAmountInput] = useState(
    isPresetInitial ? "" : initialAmount.toString()
  );
  const [salutation, setSalutation] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});
  const [prayer, setPrayer] = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlPrayer = sp.get("prayer");
      if (urlPrayer) return sanitizePrayer(urlPrayer.trim()).slice(0, FIELD_LIMITS.PRAYER.max);
    }
    return initialPrayer ? sanitizePrayer(initialPrayer.trim()).slice(0, FIELD_LIMITS.PRAYER.max) : "";
  });
  const [selectedChannelId, setSelectedChannelId] = useState("qris");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [pendingInvoiceModal, setPendingInvoiceModal] = useState({
    isOpen: false,
    invoice: null,
  });
  const [isCancellingOldInvoice, setIsCancellingOldInvoice] = useState(false);

  useEffect(() => {
    if (initialPrayer) {
      setPrayer(sanitizePrayer(initialPrayer.trim()).slice(0, FIELD_LIMITS.PRAYER.max));
    } else if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlPrayer = sp.get("prayer");
      if (urlPrayer) {
        setPrayer(sanitizePrayer(urlPrayer.trim()).slice(0, FIELD_LIMITS.PRAYER.max));
      }
    }
  }, [initialPrayer]);

  useEffect(() => {
    const initSessionAndDraft = async () => {
      const user = getStoredUser();
      setCurrentUser(user);
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
        setIsEmailLocked(true);
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
    if (errors.amount) {
      setErrors(({ amount: _stale, ...rest }) => rest);
    }
  };

  const channelLimits = useMemo(() => {
    return getPaymentChannelLimits(selectedChannelId);
  }, [selectedChannelId]);

  const handleSelectChannel = (channelId) => {
    setSelectedChannelId(channelId);
    const newLimits = getPaymentChannelLimits(channelId);
    if (amount > newLimits.maxAmount) {
      setAmount(newLimits.maxAmount);
      if (isCustomMode) {
        setCustomAmountInput(String(newLimits.maxAmount));
      }
      toast.info(`Nominal donasi disesuaikan ke ${formatRupiah(newLimits.maxAmount)} (batas maksimal ${newLimits.label})`);
    }
  };

  const handleCustomModeClick = () => {
    setIsCustomMode(true);
    const num = Number(customAmountInput);
    setAmount(num || 0);
  };

  const handleCustomInputChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, "").slice(0, 9);
    const num = Number(rawVal);
    const clamped = Math.min(num, channelLimits.maxAmount);
    const finalRaw = clamped > 0 ? String(clamped) : (rawVal === "" ? "" : "0");
    setCustomAmountInput(finalRaw);
    setAmount(clamped);
    if (errors.amount) {
      setErrors(({ amount: _stale, ...rest }) => rest);
    }
  };

  const handleCustomInputBlur = () => {
    if (isCustomMode && customAmountInput.trim() !== "") {
      const num = Number(customAmountInput);
      if (num > 0 && num < channelLimits.minAmount) {
        setAmount(channelLimits.minAmount);
        setCustomAmountInput(String(channelLimits.minAmount));
        if (errors.amount) {
          setErrors(({ amount: _stale, ...rest }) => rest);
        }
      } else if (num > channelLimits.maxAmount) {
        setAmount(channelLimits.maxAmount);
        setCustomAmountInput(String(channelLimits.maxAmount));
        if (errors.amount) {
          setErrors(({ amount: _stale, ...rest }) => rest);
        }
      }
    }
  };

  // Real-time feedback: kosong tidak dianggap error agar tidak "berteriak" sebelum user mengetik
  const liveAmountError =
    isCustomMode && customAmountInput !== "" && amount < channelLimits.minAmount
      ? `Nominal donasi minimal ${formatRupiah(channelLimits.minAmount)}`
      : isCustomMode && amount > channelLimits.maxAmount
      ? `Batas maksimal transaksi ${channelLimits.label} adalah ${formatRupiah(channelLimits.maxAmount)}`
      : null;
  const amountError = liveAmountError || errors.amount || null;

  const handlePrayerChange = (e) => {
    const clean = sanitizePrayer(e.target.value);
    if (clean.length <= FIELD_LIMITS.PRAYER.max) {
      setPrayer(clean);
    }
  };

  const selectedChannel = PAYMENT_CHANNELS.find((c) => c.id === selectedChannelId) || PAYMENT_CHANNELS[0];
  const adminFee = selectedChannel.fee || 0;
  const totalPayment = amount + adminFee;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isSubmittingRef.current) return;

    const newErrors = {};
    if (amount < channelLimits.minAmount) {
      newErrors.amount = `Nominal donasi minimal ${formatRupiah(channelLimits.minAmount)}`;
    } else if (amount > channelLimits.maxAmount) {
      newErrors.amount = `Nominal donasi maksimal ${channelLimits.label} adalah ${formatRupiah(channelLimits.maxAmount)}`;
    }

    const nameVal = validateName(donorName, isAnonymous);
    if (!nameVal.isValid) {
      newErrors.donorName = nameVal.message;
    }

    const phoneVal = validatePhone(donorPhone);
    if (!phoneVal.isValid) {
      newErrors.donorPhone = phoneVal.message;
    }

    const emailVal = validateEmail(donorEmail, true);
    if (!emailVal.isValid) {
      newErrors.donorEmail = emailVal.message || "Email donatur wajib diisi dengan format yang benar.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }
    setErrors({});

    // Cek apakah ada invoice aktif yang belum diselesaikan untuk program ini
    if (campaign?.id && donorEmail) {
      try {
        isSubmittingRef.current = true;
        setIsSubmitting(true);
        const checkRes = await safeFetch(
          `/api/user/donations?mode=pending&email=${encodeURIComponent(donorEmail)}&campaignId=${encodeURIComponent(campaign.id)}`
        );
        const checkJson = await checkRes.json();
        if (checkRes.ok && checkJson.success && Array.isArray(checkJson.data) && checkJson.data.length > 0) {
          setPendingInvoiceModal({
            isOpen: true,
            invoice: checkJson.data[0],
          });
          isSubmittingRef.current = false;
          setIsSubmitting(false);
          return;
        }
      } catch {
        // Fallback lanjutkan jika pengecekan gagal
      } finally {
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    }

    await executeDonationCreation();
  };

  const executeDonationCreation = async () => {
    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      const idempotencyKey = generateIdempotencyKey();
      const sanitizedPrayer = prayer.trim().replace(/\s+/g, " ");

      const effectiveDonorName = isAnonymous
        ? "Hamba Allah"
        : (salutation ? `${salutation} ${donorName.trim()}`.trim() : donorName.trim());

      const res = await safeFetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign?.id || null,
          campaignTitle: campaign?.title || (isZakat ? "Tunaikan Zakat, Hadirkan Manfaat" : "Sedekah Umum PABE"),
          campaignSlug: campaign?.slug || (isZakat ? "zakat" : ""),
          donationType: isZakat ? "ZAKAT" : "CAMPAIGN",
          amount,
          paymentChannelId: selectedChannelId,
          donorName: effectiveDonorName,
          donorEmail: donorEmail.trim(),
          donorPhone: donorPhone.trim(),
          donorAvatar: isAnonymous ? null : (currentUser?.avatar || null),
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

      // Sinkronisasi sesi lokal donatur jika sebelumnya belum memiliki nomor WhatsApp di profil
      if (currentUser && (!currentUser.phone || currentUser.phone === "-") && donorPhone.trim()) {
        loginUser({ ...currentUser, phone: donorPhone.trim() });
      }

      toast.info("Mengalihkan ke instruksi pembayaran, mohon tunggu sebentar...", {
        title: "Tagihan Berhasil Dibuat",
        duration: 8000,
      });

      const targetUrl = donation.accessToken
        ? `/invoice/${donation.invoiceId}?token=${donation.accessToken}`
        : `/invoice/${donation.invoiceId}`;

      setIsRedirecting(true);
      router.push(targetUrl);
    } catch (err) {
      toast.error(err.message || "Gagal memproses transaksi. Silakan coba kembali.");
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setIsRedirecting(false);
    }
  };

  const handleContinueExistingInvoice = () => {
    if (!pendingInvoiceModal.invoice) return;
    const inv = pendingInvoiceModal.invoice;
    setPendingInvoiceModal({ isOpen: false, invoice: null });
    toast.info("Memuat instruksi pembayaran tagihan aktif...", {
      title: "Mengalihkan Tagihan",
      duration: 6000,
    });
    setIsRedirecting(true);
    setIsSubmitting(true);
    const targetUrl = inv.accessToken
      ? `/invoice/${inv.invoiceId}?token=${inv.accessToken}`
      : `/invoice/${inv.invoiceId}`;
    router.push(targetUrl);
  };

  const handleCreateNewAfterCancel = async () => {
    if (!pendingInvoiceModal.invoice) return;
    try {
      setIsCancellingOldInvoice(true);
      await safeFetch("/api/user/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: pendingInvoiceModal.invoice.invoiceId,
          action: "cancel",
        }),
      });
      setPendingInvoiceModal({ isOpen: false, invoice: null });
      await executeDonationCreation();
    } catch {
      toast.error("Gagal membatalkan tagihan lama. Silakan coba lagi.");
    } finally {
      setIsCancellingOldInvoice(false);
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
    isEmailLocked,
    errors,
    setErrors,
    amountError,
    prayer,
    setPrayer,
    selectedChannelId,
    setSelectedChannelId: handleSelectChannel,
    channelLimits,
    handleCustomInputBlur,
    isSubmitting,
    isRedirecting,
    hasExistingPrayer,
    selectedChannel,
    adminFee,
    totalPayment,
    handlePresetClick,
    handleCustomModeClick,
    handleCustomInputChange,
    handlePrayerChange,
    handleSubmit,
    pendingInvoiceModal,
    setPendingInvoiceModal,
    isCancellingOldInvoice,
    handleContinueExistingInvoice,
    handleCreateNewAfterCancel,
    isZakat,
    salutation,
    setSalutation,
  };
}
