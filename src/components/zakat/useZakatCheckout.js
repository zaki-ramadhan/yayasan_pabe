/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/useToast";
import { getStoredUser } from "@/services/authService";
import { ZAKAT_TYPES } from "@/constants/zakatTypes";
import { formatRupiah } from "@/lib/formatters";
import { saveDonorInvoice } from "@/lib/donorStorage";
import { safeFetch } from "@/lib/safeFetch";
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
} from "@/lib/security";

export { NOMINAL_PRESETS };

export function useZakatCheckout({
  initialType = "ZAKAT_PENGHASILAN",
  initialAmount = 50000,
  targetCampaign = null,
  isFromCalculator = false,
} = {}) {
  const router = useRouter();

  const [selectedTypeId, setSelectedTypeId] = useState(() => {
    const valid = ZAKAT_TYPES.some((t) => t.id === initialType);
    return valid ? initialType : "ZAKAT_PENGHASILAN";
  });

  const [errors, setErrors] = useState({});

  const normalizedInitialAmount =
    !isNaN(Number(initialAmount)) && Number(initialAmount) >= 10000
      ? Number(initialAmount)
      : 50000;

  const {
    amount,
    setAmount,
    isCustomMode,
    customAmountInput,
    selectedChannelId,
    setSelectedChannelId,
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
    initialAmount: normalizedInitialAmount,
    presets: NOMINAL_PRESETS,
    isZakat: true,
    isFromCalculator,
    onClearAmountError: () => {
      setErrors((prev) => {
        if (!prev.amount) return prev;
        const { amount: _stale, ...rest } = prev;
        return rest;
      });
    },
  });

  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [muzakkiName, setMuzakkiName] = useState("");
  const [muzakkiPhone, setMuzakkiPhone] = useState("");
  const [muzakkiEmail, setMuzakkiEmail] = useState("");
  const [isEmailLocked, setIsEmailLocked] = useState(false);
  const [muzakkiNpwp, setMuzakkiNpwp] = useState("");
  const [prayer, setPrayer] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isCancellingOldInvoice, setIsCancellingOldInvoice] = useState(false);
  const [pendingInvoiceModal, setPendingInvoiceModal] = useState({
    isOpen: false,
    invoice: null,
  });

  const isSubmittingRef = useRef(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      const currentUrl =
        typeof window !== "undefined"
          ? window.location.pathname + window.location.search
          : "/zakat/bayar";
      router.replace(
        `/login?redirect=${encodeURIComponent(currentUrl)}&reason=donation_requires_login`
      );
      return;
    }

    if (user.name && user.name !== "Pengguna Google" && user.name !== "Pengguna Facebook") {
      setMuzakkiName(user.name);
    }
    if (user.email && !user.email.endsWith("@google.user") && !user.email.endsWith("@facebook.user")) {
      setMuzakkiEmail(user.email);
      setIsEmailLocked(true);
    }
    if (user.phone && user.phone !== "-") {
      setMuzakkiPhone(user.phone);
    }
  }, [router]);

  const currentZakat =
    ZAKAT_TYPES.find((t) => t.id === selectedTypeId) || ZAKAT_TYPES[0];

  const amountError = liveAmountError || errors.amount || null;

  const validate = () => {
    const newErrors = {};

    if (!amount || amount < channelLimits.minAmount) {
      newErrors.amount = `Nominal zakat minimal ${formatRupiah(channelLimits.minAmount)}.`;
    } else if (amount > channelLimits.maxAmount) {
      newErrors.amount = `Nominal zakat maksimal ${channelLimits.label} adalah ${formatRupiah(channelLimits.maxAmount)}.`;
    }

    const nameVal = validateName(muzakkiName, false);
    if (!nameVal.isValid) {
      newErrors.muzakkiName = nameVal.message || "Nama lengkap wajib diisi.";
    }

    const emailVal = validateEmail(muzakkiEmail, true);
    if (!emailVal.isValid) {
      newErrors.muzakkiEmail = emailVal.message || "Alamat email aktif wajib diisi.";
    }

    if (muzakkiPhone && muzakkiPhone.trim()) {
      const phoneVal = validatePhone(muzakkiPhone, { isRequired: false });
      if (!phoneVal.isValid) {
        newErrors.muzakkiPhone = phoneVal.message || "Format nomor telepon tidak valid.";
      }
    }

    setErrors(newErrors);
    return {
      isValid: Object.keys(newErrors).length === 0,
      firstError: Object.values(newErrors)[0] || null,
    };
  };

  const executePayment = async () => {
    try {
      setIsSubmitting(true);
      isSubmittingRef.current = true;

      const idempotencyKey = generateIdempotencyKey();
      const rawName = muzakkiName.trim();

      let finalPrayer = sanitizePrayer(prayer || "");
      if (muzakkiNpwp && muzakkiNpwp.trim()) {
        const npwpNote = `[NPWP/NIK: ${muzakkiNpwp.trim()}]`;
        finalPrayer = finalPrayer ? `${finalPrayer} ${npwpNote}` : npwpNote;
      }

      const payload = {
        campaignId: targetCampaign?.id || null,
        campaignTitle: isFromCalculator
          ? currentZakat.label
          : targetCampaign?.title || currentZakat.label,
        campaignSlug: targetCampaign?.slug || "zakat",
        donationType: "ZAKAT",
        zakatType: selectedTypeId,
        amount: Number(amount),
        paymentChannelId: selectedChannelId,
        donorName: rawName,
        donorEmail: muzakkiEmail.trim().toLowerCase(),
        donorPhone: muzakkiPhone.trim() || undefined,
        isAnonymous: Boolean(isAnonymous),
        prayer: finalPrayer,
        idempotencyKey,
        turnstileToken,
      };

      const res = await safeFetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        turnstileRef.current?.reset();
        setTurnstileToken("");
        throw new Error(json.message || "Gagal membuat tagihan zakat.");
      }

      const donation = json.data;
      saveDonorInvoice({
        invoiceId: donation.invoiceId,
        token: donation.accessToken || "",
        campaignSlug: targetCampaign?.slug || "zakat",
        donorName: donation.donorName,
        isAnonymous: Boolean(isAnonymous),
        hasPrayer: Boolean(finalPrayer),
      });

      toast.success("Tagihan zakat berhasil diterbitkan.");
      const targetUrl = donation.accessToken
        ? `/invoice/${donation.invoiceId}?token=${donation.accessToken}`
        : `/invoice/${donation.invoiceId}`;
      setIsRedirecting(true);
      router.push(targetUrl);
    } catch (err) {
      turnstileRef.current?.reset();
      setTurnstileToken("");
      toast.error(err.message || "Terjadi kesalahan saat memproses zakat.");
      setIsSubmitting(false);
      setIsRedirecting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (isSubmitting || isRedirecting || isSubmittingRef.current) return;

    const { isValid, firstError } = validate();
    if (!isValid) {
      toast.error(firstError || "Harap lengkapi formulir zakat dengan benar.");
      return;
    }

    if (!turnstileToken) {
      toast.error("Verifikasi keamanan Turnstile wajib diselesaikan.");
      return;
    }

    try {
      isSubmittingRef.current = true;
      setIsSubmitting(true);
      const emailQuery = muzakkiEmail.trim();
      const phoneQuery = muzakkiPhone.trim();
      if (emailQuery || phoneQuery) {
        const campaignParam = targetCampaign?.id
          ? `&campaignId=${encodeURIComponent(targetCampaign.id)}`
          : "";
        const checkRes = await safeFetch(
          `/api/user/donations?mode=pending&type=ZAKAT&email=${encodeURIComponent(emailQuery)}&phone=${encodeURIComponent(phoneQuery)}${campaignParam}`
        );
        const checkJson = await checkRes.json();
        if (
          checkRes.ok &&
          checkJson.success &&
          Array.isArray(checkJson.data) &&
          checkJson.data.length > 0
        ) {
          setPendingInvoiceModal({
            isOpen: true,
            invoice: checkJson.data[0],
          });
          isSubmittingRef.current = false;
          setIsSubmitting(false);
          return;
        }
      }
    } catch {
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }

    await executePayment();
  };

  const handleContinueExisting = () => {
    if (!pendingInvoiceModal.invoice) return;
    const inv = pendingInvoiceModal.invoice;
    setPendingInvoiceModal({ isOpen: false, invoice: null });
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

      if (!res.ok && json.message?.toLowerCase().includes("sudah terbayar")) {
        toast.error("Tagihan lama ini telah terbayar. Mengalihkan ke kuitansi...");
        setPendingInvoiceModal({ isOpen: false, invoice: null });
        router.push(`/invoice/${pendingInvoiceModal.invoice.invoiceId}`);
        return;
      }

      setPendingInvoiceModal({ isOpen: false, invoice: null });
      await executePayment();
    } catch {
      setPendingInvoiceModal({ isOpen: false, invoice: null });
      await executePayment();
    } finally {
      setIsCancellingOldInvoice(false);
    }
  };

  return {
    selectedTypeId,
    setSelectedTypeId,
    amount,
    setAmount,
    isCustomMode,
    customAmountInput,
    channelLimits,
    amountError,
    handlePresetClick,
    handleCustomModeClick,
    handleCustomInputChange,
    handleCustomInputBlur,
    selectedChannelId,
    setSelectedChannelId,
    selectedChannel,
    adminFee,
    totalPayment,
    isAnonymous,
    setIsAnonymous,
    muzakkiName,
    setMuzakkiName,
    muzakkiPhone,
    setMuzakkiPhone,
    muzakkiEmail,
    setMuzakkiEmail,
    isEmailLocked,
    muzakkiNpwp,
    setMuzakkiNpwp,
    prayer,
    setPrayer,
    errors,
    setErrors,
    isSubmitting,
    isRedirecting,
    isCancellingOldInvoice,
    handleSubmit,
    pendingInvoiceModal,
    setPendingInvoiceModal,
    handleContinueExisting,
    handleCreateNewAfterCancel,
    turnstileToken,
    setTurnstileToken,
    turnstileRef,
  };
}
