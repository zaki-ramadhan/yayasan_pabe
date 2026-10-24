"use client";

import { useState, useEffect } from "react";
import { DONATION_LIMITS, validateName, validatePhone, sanitizePhone } from "@/lib/security";
import { formatRupiah, isCampaignClosed } from "@/lib/formatters";
import { getStoredUser } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function useRoutineDonation({ campaigns = [] }) {
  const [salutation, setSalutation] = useState("Bapak");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const activeCampaigns = (campaigns && campaigns.length > 0 ? campaigns : []).filter(
    (c) => !isCampaignClosed(c)
  );
  const defaultCampaignId = activeCampaigns[0]?.id || campaigns[0]?.id || "camp-001";

  // Pre-fill user data from session if authenticated
  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;

    queueMicrotask(() => {
      if (user.name && user.name !== "Pengguna Google" && user.name !== "Pengguna Facebook") {
        setFullName(user.name);
      }
      if (user.phone && user.phone !== "-") {
        const cleanPhone = sanitizePhone(user.phone);
        if (cleanPhone) {
          setWhatsapp(cleanPhone);
        }
      }
    });
  }, []);

  // Multi-program state (max 2)
  const [selectedPrograms, setSelectedPrograms] = useState([
    {
      id: 1,
      campaignId: defaultCampaignId,
      frequency: "DAILY",
      selectedDay: "jumat",
      monthlyDate: new Date().toISOString(),
      routineType: "REMINDER_ONLY",
      hasCustomPeriod: false,
      startDate: "",
      endDate: "",
      reminderTime: "05:00",
      amount: 25000,
      customAmount: "",
      paymentChannelId: "qris",
    },
  ]);

  const handleAddProgram = () => {
    if (selectedPrograms.length >= 2) {
      toast.error("Maksimal 2 program dalam satu jadwal donasi rutin.");
      return;
    }
    const nextCampaign =
      activeCampaigns[selectedPrograms.length % (activeCampaigns.length || 1)] || activeCampaigns[0];
    setSelectedPrograms((prev) => [
      ...prev,
      {
        id: (prev[prev.length - 1]?.id || 0) + 1,
        campaignId: nextCampaign ? nextCampaign.id : defaultCampaignId,
        frequency: "DAILY",
        selectedDay: "jumat",
        monthlyDate: new Date().toISOString(),
        routineType: "REMINDER_ONLY",
        hasCustomPeriod: false,
        startDate: "",
        endDate: "",
        reminderTime: "05:00",
        amount: 25000,
        customAmount: "",
        paymentChannelId: "qris",
      },
    ]);
  };

  const handleRemoveProgram = (id) => {
    if (selectedPrograms.length === 1) {
      toast.error("Minimal harus memilih 1 program donasi rutin.");
      return;
    }
    setSelectedPrograms((prev) => prev.filter((p) => p.id !== id));
  };

  const handleProgramChange = (id, field, value) => {
    setSelectedPrograms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const totalPerCommitment = selectedPrograms.reduce((sum, item) => {
    if (item.routineType === "REMINDER_ONLY") return sum;
    const val = item.customAmount
      ? parseInt(item.customAmount.replace(/\D/g, ""), 10) || 0
      : item.amount;
    return sum + val;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Identitas
    const nameVal = validateName(fullName, isAnonymous);
    if (!nameVal.isValid) {
      toast.error(nameVal.message);
      return;
    }

    const phoneVal = validatePhone(whatsapp);
    if (!phoneVal.isValid) {
      toast.error(phoneVal.message);
      return;
    }

    // 2. Validasi Tiap Program
    for (let i = 0; i < selectedPrograms.length; i++) {
      const p = selectedPrograms[i];

      if (p.hasCustomPeriod && p.startDate && p.endDate && p.startDate > p.endDate) {
        toast.error(`Tanggal mulai tidak boleh lebih lambat dari tanggal berakhir pada Program ${i + 1}.`);
        return;
      }

      if (p.routineType === "AUTO_DONATION") {
        const nominal = p.customAmount
          ? parseInt(p.customAmount.replace(/\D/g, ""), 10) || 0
          : p.amount;

        if (!nominal || nominal < DONATION_LIMITS.MIN_AMOUNT) {
          toast.error(
            `Nominal Program ${i + 1} minimal ${formatRupiah(DONATION_LIMITS.MIN_AMOUNT)}`
          );
          return;
        }

        if (nominal > DONATION_LIMITS.MAX_AMOUNT) {
          toast.error(
            `Nominal Program ${i + 1} maksimal ${formatRupiah(DONATION_LIMITS.MAX_AMOUNT)}`
          );
          return;
        }
      }
    }

    const hasAutoDonation = selectedPrograms.some((p) => p.routineType === "AUTO_DONATION");
    if (hasAutoDonation && totalPerCommitment <= 0) {
      toast.error("Mohon tentukan nominal donasi otomatis yang valid.");
      return;
    }

    try {
      setIsSubmitting(true);
      const payloadPrograms = selectedPrograms.map((p) => {
        const camp = activeCampaigns.find((c) => c.id === p.campaignId) || activeCampaigns[0];
        const nominal = p.customAmount
          ? parseInt(p.customAmount.replace(/\D/g, ""), 10) || 0
          : p.amount;

        return {
          campaignId: p.campaignId,
          programTitle: camp?.title || "Program Kebaikan Rutin",
          amount: p.routineType === "REMINDER_ONLY" ? 0 : nominal,
          frequency: p.frequency,
          routineType: p.routineType,
          selectedDay: p.selectedDay,
          monthlyDate: p.monthlyDate,
          reminderTime: p.reminderTime,
        };
      });

      const res = await safeFetch("/api/routine-donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: isAnonymous ? "Hamba Allah" : `${salutation ? salutation + " " : ""}${fullName}`.trim(),
          donorPhone: whatsapp,
          isAnonymous,
          programs: payloadPrograms,
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Gagal mengaktifkan jadwal donasi rutin.");
      }

      setIsSubmitted(true);
      toast.success(result.message || "Jadwal donasi rutin Anda berhasil diaktifkan!");
    } catch (err) {
      toast.error(err.message || "Terjadi kendala saat menyimpan jadwal donasi rutin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    salutation,
    setSalutation,
    fullName,
    setFullName,
    whatsapp,
    setWhatsapp,
    isAnonymous,
    setIsAnonymous,
    isSubmitting,
    isSubmitted,
    setIsSubmitted,
    activeCampaigns,
    selectedPrograms,
    totalPerCommitment,
    handleAddProgram,
    handleRemoveProgram,
    handleProgramChange,
    handleSubmit,
  };
}
