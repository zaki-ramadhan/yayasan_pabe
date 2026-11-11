"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/useToast";
import { getStoredUser } from "@/services/authService";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { ZAKAT_TYPES } from "@/constants/zakatTypes";
import {
  generateIdempotencyKey,
  validateName,
  validatePhone,
  sanitizePrayer,
} from "@/lib/security";

export function useZakatCheckout({
  initialType = "ZAKAT_PENGHASILAN",
  initialAmount = 250000,
  targetCampaign = null,
} = {}) {
  const router = useRouter();

  const [selectedTypeId, setSelectedTypeId] = useState(() => {
    const valid = ZAKAT_TYPES.some((t) => t.id === initialType);
    return valid ? initialType : "ZAKAT_PENGHASILAN";
  });

  const [amount, setAmount] = useState(() => {
    const n = Number(initialAmount);
    return !isNaN(n) && n >= 10000 ? n : 250000;
  });

  const [selectedChannelId, setSelectedChannelId] = useState("qris");
  const [salutation, setSalutation] = useState("Bapak");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [muzakkiName, setMuzakkiName] = useState("");
  const [muzakkiPhone, setMuzakkiPhone] = useState("");
  const [muzakkiEmail, setMuzakkiEmail] = useState("");
  const [muzakkiNpwp, setMuzakkiNpwp] = useState("");
  const [prayer, setPrayer] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingInvoiceModal, setPendingInvoiceModal] = useState({
    isOpen: false,
    invoice: null,
  });

  const isSubmittingRef = useRef(false);

  // Auto-fill profil muzakki jika sudah login
  useEffect(() => {
    const user = getStoredUser();
    if (user) {
      if (user.name) setMuzakkiName(user.name);
      if (user.email) setMuzakkiEmail(user.email);
      if (user.phone) setMuzakkiPhone(user.phone);
    }
  }, []);

  const selectedChannel =
    PAYMENT_CHANNELS.find((c) => c.id === selectedChannelId) || PAYMENT_CHANNELS[0];

  const currentZakat =
    ZAKAT_TYPES.find((t) => t.id === selectedTypeId) || ZAKAT_TYPES[0];

  const validate = () => {
    const newErrors = {};

    if (!amount || amount < 10000) {
      newErrors.amount = "Nominal zakat minimal Rp 10.000.";
    }

    if (!isAnonymous) {
      const nameVal = validateName(muzakkiName);
      if (!nameVal.isValid) {
        newErrors.muzakkiName = nameVal.message || "Nama lengkap wajib diisi.";
      }
    }

    const phoneVal = validatePhone(muzakkiPhone, { isRequired: true });
    if (!phoneVal.isValid) {
      newErrors.muzakkiPhone = phoneVal.message || "Nomor WhatsApp wajib diisi.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const executePayment = async () => {
    try {
      setIsSubmitting(true);
      isSubmittingRef.current = true;

      const idempotencyKey = generateIdempotencyKey();
      const rawName = isAnonymous
        ? "Hamba Allah"
        : `${salutation ? salutation + " " : ""}${muzakkiName.trim()}`;

      // Susun catatan doa & NPWP jika ada
      let finalPrayer = sanitizePrayer(prayer || "");
      if (muzakkiNpwp && muzakkiNpwp.trim()) {
        const npwpNote = `[NPWP/NIK: ${muzakkiNpwp.trim()}]`;
        finalPrayer = finalPrayer ? `${finalPrayer} ${npwpNote}` : npwpNote;
      }

      const payload = {
        campaignId: targetCampaign?.id || null,
        campaignTitle: currentZakat.label,
        campaignSlug: targetCampaign?.slug || "zakat",
        donationType: "ZAKAT",
        amount: Number(amount),
        paymentChannelId: selectedChannelId,
        donorName: rawName,
        donorEmail: muzakkiEmail.trim() || undefined,
        donorPhone: muzakkiPhone.trim(),
        isAnonymous: Boolean(isAnonymous),
        prayer: finalPrayer,
        idempotencyKey,
      };

      const res = await fetch("/api/donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal membuat tagihan zakat.");
      }

      toast.success("Tagihan zakat berhasil diterbitkan.");
      router.push(`/invoice/${json.data.invoiceId}`);
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan saat memproses zakat.");
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }
    if (isSubmitting || isSubmittingRef.current) return;

    if (!validate()) {
      toast.error("Harap lengkapi formulir zakat dengan benar.");
      return;
    }

    // Cek apakah ada invoice aktif yang belum dibayar
    try {
      const emailQuery = muzakkiEmail.trim();
      const phoneQuery = muzakkiPhone.trim();
      if (emailQuery || phoneQuery) {
        const checkRes = await fetch(
          `/api/user/donations?mode=pending&email=${encodeURIComponent(emailQuery)}&phone=${encodeURIComponent(phoneQuery)}`
        );
        const checkJson = await checkRes.json();
        if (checkRes.ok && checkJson.success && Array.isArray(checkJson.data) && checkJson.data.length > 0) {
          setPendingInvoiceModal({
            isOpen: true,
            invoice: checkJson.data[0],
          });
          return;
        }
      }
    } catch {
      // Jika cek tagihan gagal, lanjutkan transaksi baru
    }

    await executePayment();
  };

  const handleContinueExisting = () => {
    if (!pendingInvoiceModal.invoice) return;
    const inv = pendingInvoiceModal.invoice;
    setPendingInvoiceModal({ isOpen: false, invoice: null });
    router.push(`/invoice/${inv.invoiceId}`);
  };

  const handleCreateNewAfterCancel = async () => {
    if (!pendingInvoiceModal.invoice) return;
    try {
      await fetch("/api/user/donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: pendingInvoiceModal.invoice.invoiceId,
          action: "cancel",
        }),
      });
    } catch {
      // Abaikan jika pembatalan invoice lama gagal
    }
    setPendingInvoiceModal({ isOpen: false, invoice: null });
    await executePayment();
  };

  return {
    selectedTypeId,
    setSelectedTypeId,
    amount,
    setAmount,
    selectedChannelId,
    setSelectedChannelId,
    selectedChannel,
    salutation,
    setSalutation,
    isAnonymous,
    setIsAnonymous,
    muzakkiName,
    setMuzakkiName,
    muzakkiPhone,
    setMuzakkiPhone,
    muzakkiEmail,
    setMuzakkiEmail,
    muzakkiNpwp,
    setMuzakkiNpwp,
    prayer,
    setPrayer,
    errors,
    setErrors,
    isSubmitting,
    handleSubmit,
    pendingInvoiceModal,
    setPendingInvoiceModal,
    handleContinueExisting,
    handleCreateNewAfterCancel,
  };
}

