/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useSyncExternalStore, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah } from "@/lib/formatters";
import {
  useNominalSelection,
  NOMINAL_PRESETS,
} from "@/components/donation/useNominalSelection";
import {
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
import { getCampaignDonateHref } from "@/lib/zisFilter";
import { FIELD_LIMITS } from "@/constants/fieldValidationLimits";

export { NOMINAL_PRESETS };

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

  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [errors, setErrors] = useState({});

  const {
    amount,
    setAmount,
    isCustomMode,
    setIsCustomMode,
    customAmountInput,
    setCustomAmountInput,
    selectedChannelId,
    setSelectedChannelId: handleSelectChannel,
    rawSetSelectedChannelId,
    channelLimits,
    selectedChannel,
    adminFee,
    totalPayment,
    liveAmountError,
    handlePresetClick,
    handleCustomModeClick,
    handleCustomInputChange,
    handleCustomInputBlur,
  } = useNominalSelection({
    initialAmount,
    isZakat,
    onClearAmountError: () => {
      setErrors((prev) => {
        if (!prev.amount) return prev;
        const { amount: _stale, ...rest } = prev;
        return rest;
      });
    },
  });

  const [prayer, setPrayer] = useState(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const urlPrayer = sp.get("prayer");
      if (urlPrayer) return sanitizePrayer(urlPrayer.trim()).slice(0, FIELD_LIMITS.PRAYER.max);
    }
    return initialPrayer ? sanitizePrayer(initialPrayer.trim()).slice(0, FIELD_LIMITS.PRAYER.max) : "";
  });
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
            : getCampaignDonateHref(campaign);
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
        if (draft.selectedChannelId) rawSetSelectedChannelId(draft.selectedChannelId);
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

  const amountError = liveAmountError || errors.amount || null;

  const handlePrayerChange = (e) => {
    const clean = sanitizePrayer(e.target.value);
    if (clean.length <= FIELD_LIMITS.PRAYER.max) {
      setPrayer(clean);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || isSubmittingRef.current) return;

    const newErrors = {};
    if (amount < channelLimits.minAmount) {
      newErrors.amount = `Nominal donasi minimal ${formatRupiah(channelLimits.minAmount)}`;
    } else if (amount > channelLimits.maxAmount) {
      newErrors.amount = `Nominal donasi maksimal ${channelLimits.label} adalah ${formatRupiah(channelLimits.maxAmount)}`;
    }

    const nameVal = validateName(donorName, false);
    if (!nameVal.isValid) {
      newErrors.donorName = nameVal.message;
    }

    if (donorPhone && donorPhone.trim()) {
      const phoneVal = validatePhone(donorPhone, { isRequired: false, fieldName: "Nomor telepon" });
      if (!phoneVal.isValid) {
        newErrors.donorPhone = phoneVal.message;
      }
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

      const effectiveDonorName = donorName.trim();

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
          turnstileToken,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        turnstileRef.current?.reset();
        setTurnstileToken("");
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
        loginUser({ ...currentUser, phone: donorPhone.trim() }, { notifyLogin: false });
      }

      toast.info("Menyiapkan invoice pembayaran, mohon tunggu sebentar...", {
        title: "Invoice Berhasil Dibuat",
        duration: 8000,
      });

      const targetUrl = donation.accessToken
        ? `/invoice/${donation.invoiceId}?token=${donation.accessToken}`
        : `/invoice/${donation.invoiceId}`;

      setIsRedirecting(true);
      router.push(targetUrl);
    } catch (err) {
      turnstileRef.current?.reset();
      setTurnstileToken("");
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
    toast.info("Memuat invoice pembayaran tagihan aktif...", {
      title: "Membuka Invoice",
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
    if (!pendingInvoiceModal.invoice || isCancellingOldInvoice) return;
    try {
      setIsCancellingOldInvoice(true);
      const res = await safeFetch("/api/user/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: pendingInvoiceModal.invoice.invoiceId,
          action: "cancel",
        }),
      });
      const json = await res.json().catch(() => ({}));

      // Jika donasi lama ternyata baru saja dibayar (PAID), arahkan ke invoice pembayarannya
      if (!res.ok && json.message?.toLowerCase().includes("sudah terbayar")) {
        toast.error("Tagihan lama ini telah terbayar. Mengalihkan ke kuitansi...");
        setPendingInvoiceModal({ isOpen: false, invoice: null });
        router.push(`/invoice/${pendingInvoiceModal.invoice.invoiceId}`);
        return;
      }

      // Dalam semua skenario lain (batal berhasil, atau tagihan lama sudah otomatis kedaluwarsa):
      // Tutup dialog konfirmasi dan langsung buat tagihan baru
      setPendingInvoiceModal({ isOpen: false, invoice: null });
      await executeDonationCreation();
    } catch {
      // Fallback defensif: tetap izinkan pembuatan tagihan baru agar donatur tidak terjebak
      setPendingInvoiceModal({ isOpen: false, invoice: null });
      await executeDonationCreation();
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
    turnstileToken,
    setTurnstileToken,
    turnstileRef,
  };
}
