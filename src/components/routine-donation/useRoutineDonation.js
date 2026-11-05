/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import {
  DONATION_LIMITS,
  validateName,
  validateEmail,
} from "@/lib/security";
import { formatRupiah, isCampaignClosed } from "@/lib/formatters";
import { getRoutineProgramAmount } from "@/lib/routineDonationConstants";
import { getStoredUser } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

export function useRoutineDonation({ campaigns = [] }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingActiveRoutine, setExistingActiveRoutine] = useState(null);
  const [isCheckingActive, setIsCheckingActive] = useState(false);

  const activeCampaigns = (campaigns && campaigns.length > 0 ? campaigns : []).filter(
    (c) => !isCampaignClosed(c)
  );
  const defaultCampaignId = activeCampaigns[0]?.id || campaigns[0]?.id || "";

  const [program, setProgram] = useState({
    id: 1,
    campaignId: defaultCampaignId,
    frequency: "WEEKLY",
    selectedDay: "jumat",
    monthlyDate: new Date().toISOString(),
    routineType: "AUTO_DONATION",
    hasCustomPeriod: false,
    startDate: null,
    endDate: null,
    reminderTime: "05:00",
    amount: 25000,
    customAmount: "",
    paymentChannelId: "qris",
  });

  useEffect(() => {
    try {
      const saved = typeof window !== "undefined" ? sessionStorage.getItem("pabe_routine_draft") : null;
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.isAnonymous !== undefined) setIsAnonymous(parsed.isAnonymous);
        if (parsed.program) setProgram((prev) => ({ ...prev, ...parsed.program }));
      }
    } catch {}

    const user = getStoredUser();
    if (!user) return;

    queueMicrotask(() => {
      if (user.name && user.name !== "Pengguna Google" && user.name !== "Pengguna Facebook") {
        setFullName((prev) => prev || user.name);
      }
      if (user.email) {
        setEmail((prev) => prev || user.email);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isSubmitted) {
      sessionStorage.removeItem("pabe_routine_draft");
      return;
    }
    try {
      sessionStorage.setItem(
        "pabe_routine_draft",
        JSON.stringify({ fullName, email, isAnonymous, program })
      );
    } catch {}
  }, [fullName, email, isAnonymous, program, isSubmitted]);

  useEffect(() => {
    if (defaultCampaignId) {
      setProgram((prev) => (!prev.campaignId ? { ...prev, campaignId: defaultCampaignId } : prev));
    }
  }, [defaultCampaignId]);

  useEffect(() => {
    if (!email || !email.includes("@")) {
      setExistingActiveRoutine(null);
      return;
    }

    const checkActive = async () => {
      try {
        setIsCheckingActive(true);
        const res = await safeFetch(`/api/routine-donations?email=${encodeURIComponent(email.trim())}`);
        const json = await res.json();
        if (json.success && json.hasActive) {
          setExistingActiveRoutine(json.routine);
        } else {
          setExistingActiveRoutine(null);
        }
      } catch {
        // Ignore check errors
      } finally {
        setIsCheckingActive(false);
      }
    };

    const timer = setTimeout(checkActive, 500);
    return () => clearTimeout(timer);
  }, [email]);

  const handleProgramChange = (arg1, arg2, arg3) => {
    const field = arg3 !== undefined ? arg2 : arg1;
    const value = arg3 !== undefined ? arg3 : arg2;
    setProgram((prev) => ({ ...prev, [field]: value }));
  };

  const totalPerCommitment =
    program.routineType === "REMINDER_ONLY" ? 0 : getRoutineProgramAmount(program);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (existingActiveRoutine) {
      const msg =
        existingActiveRoutine.status === "PAUSED"
          ? "Anda memiliki jadwal donasi rutin yang sedang dijeda. Batalkan jadwal sebelumnya untuk membuat yang baru."
          : "Anda sudah memiliki jadwal donasi rutin aktif. Batalkan jadwal sebelumnya untuk membuat yang baru.";
      toast.error(msg);
      return;
    }

    const newErrors = {};
    const nameVal = validateName(fullName, isAnonymous);
    if (!nameVal.isValid) {
      newErrors.fullName = nameVal.message;
    }

    if (!email || !email.trim()) {
      newErrors.email = "Alamat email wajib diisi untuk menerima invoice donasi.";
    } else {
      const emailVal = validateEmail(email.trim(), false);
      if (!emailVal.isValid) {
        newErrors.email = emailVal.message;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return;
    }
    setErrors({});

    if (program.hasCustomPeriod && program.startDate && program.endDate) {
      const start = new Date(program.startDate);
      const end = new Date(program.endDate);
      if (start > end) {
        handleProgramChange("startDateError", "Tanggal mulai tidak boleh lebih lambat dari tanggal berakhir");
        toast.error("Tanggal mulai tidak boleh lebih lambat dari tanggal berakhir.");
        return;
      }
    }

    if (program.routineType === "AUTO_DONATION") {
      const nominal = getRoutineProgramAmount(program);

      if (!nominal || nominal < DONATION_LIMITS.MIN_AMOUNT) {
        handleProgramChange("amountError", `Nominal minimal ${formatRupiah(DONATION_LIMITS.MIN_AMOUNT)}`);
        toast.error(`Nominal minimal ${formatRupiah(DONATION_LIMITS.MIN_AMOUNT)}`);
        return;
      }

      if (nominal > DONATION_LIMITS.MAX_AMOUNT) {
        handleProgramChange("amountError", `Nominal maksimal ${formatRupiah(DONATION_LIMITS.MAX_AMOUNT)}`);
        toast.error(`Nominal maksimal ${formatRupiah(DONATION_LIMITS.MAX_AMOUNT)}`);
        return;
      }
    }

    if (!activeCampaigns || activeCampaigns.length === 0) {
      toast.error("Belum ada program kampanye yang aktif untuk donasi rutin saat ini.");
      return;
    }

    if (program.routineType === "AUTO_DONATION" && totalPerCommitment <= 0) {
      toast.error("Mohon tentukan nominal donasi otomatis yang valid.");
      return;
    }

    try {
      setIsSubmitting(true);
      const camp = activeCampaigns.find((c) => c.id === program.campaignId) || activeCampaigns[0];
      const nominal = getRoutineProgramAmount(program);

      const payloadProgram = {
        campaignId: camp?.id || program.campaignId,
        programTitle: camp?.title || "Program Kebaikan Rutin",
        amount: program.routineType === "REMINDER_ONLY" ? 0 : nominal,
        frequency: program.frequency,
        routineType: program.routineType,
        selectedDay: program.selectedDay,
        monthlyDate: program.monthlyDate,
        reminderTime: program.reminderTime,
        hasCustomPeriod: Boolean(program.hasCustomPeriod && program.startDate && program.endDate),
        startDate: program.startDate || null,
        endDate: program.endDate || null,
      };

      const res = await safeFetch("/api/routine-donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donorName: isAnonymous ? "Hamba Allah" : fullName.trim(),
          donorPhone: null,
          donorEmail: email && email.trim() ? email.trim() : null,
          isAnonymous,
          programs: [payloadProgram],
        }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.message || "Gagal mengaktifkan jadwal donasi rutin.");
      }

      setIsSubmitted(true);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pabe_routine_draft");
      }
      toast.success(result.message || "Jadwal donasi rutin Anda berhasil diaktifkan!");
    } catch (err) {
      toast.error(err.message || "Terjadi kendala saat menyimpan jadwal donasi rutin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    fullName,
    setFullName,
    email,
    setEmail,
    isAnonymous,
    setIsAnonymous,
    errors,
    setErrors,
    isSubmitting,
    isSubmitted,
    setIsSubmitted,
    activeCampaigns,
    program,
    selectedPrograms: [program],
    totalPerCommitment,
    handleProgramChange,
    handleSubmit,
    existingActiveRoutine,
    isCheckingActive,
  };
}
