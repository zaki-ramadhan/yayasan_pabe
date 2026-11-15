"use client";

import { useState, useMemo } from "react";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { getPaymentChannelLimits } from "@/data/transactionLimits";
import { formatRupiah } from "@/lib/formatters";
import { toast } from "@/hooks/useToast";

export const NOMINAL_PRESETS = [25000, 50000, 100000, 250000, 500000];

/**
 * Shared hook untuk state dan interaksi pemilihan nominal donasi/zakat
 * beserta validasi batas metode pembayaran (QRIS / Virtual Account).
 */
export function useNominalSelection({
  initialAmount = 50000,
  presets = NOMINAL_PRESETS,
  initialChannelId = "qris",
  isZakat = false,
  isFromCalculator = false,
  onClearAmountError,
} = {}) {
  const isPresetInitial = presets.includes(initialAmount);
  const [isCustomMode, setIsCustomMode] = useState(
    !isFromCalculator && !isPresetInitial
  );
  const [amount, setAmount] = useState(initialAmount);
  const [customAmountInput, setCustomAmountInput] = useState(
    isPresetInitial || isFromCalculator ? "" : String(initialAmount)
  );
  const [selectedChannelId, setSelectedChannelId] = useState(initialChannelId);

  const labelType = isZakat ? "zakat" : "donasi";

  const channelLimits = useMemo(() => {
    return getPaymentChannelLimits(selectedChannelId);
  }, [selectedChannelId]);

  const selectedChannel = useMemo(() => {
    return (
      PAYMENT_CHANNELS.find((c) => c.id === selectedChannelId) ||
      PAYMENT_CHANNELS[0]
    );
  }, [selectedChannelId]);

  const adminFee = selectedChannel.fee || 0;
  const totalPayment = amount + adminFee;

  const handlePresetClick = (val) => {
    setIsCustomMode(false);
    setAmount(val);
    setCustomAmountInput("");
    onClearAmountError?.();
  };

  const handleSelectChannel = (channelId) => {
    setSelectedChannelId(channelId);
    const newLimits = getPaymentChannelLimits(channelId);
    if (!isFromCalculator && amount > newLimits.maxAmount) {
      setAmount(newLimits.maxAmount);
      if (isCustomMode) {
        setCustomAmountInput(String(newLimits.maxAmount));
      }
      toast.info(
        `Nominal ${labelType} disesuaikan ke ${formatRupiah(newLimits.maxAmount)} (batas maksimal ${newLimits.label})`
      );
    }
  };

  const handleCustomModeClick = () => {
    setIsCustomMode(true);
    const num = Number(customAmountInput);
    setAmount(num || 0);
  };

  const handleCustomInputChange = (e) => {
    const rawVal = String(e?.target?.value ?? "").replace(/\D/g, "").slice(0, 9);
    const num = Number(rawVal);
    const clamped = Math.min(num, channelLimits.maxAmount);
    const finalRaw = clamped > 0 ? String(clamped) : rawVal === "" ? "" : "0";
    setCustomAmountInput(finalRaw);
    setAmount(clamped);
    onClearAmountError?.();
  };

  const handleCustomInputBlur = () => {
    if (isCustomMode && customAmountInput.trim() !== "") {
      const num = Number(customAmountInput);
      if (num > 0 && num < channelLimits.minAmount) {
        setAmount(channelLimits.minAmount);
        setCustomAmountInput(String(channelLimits.minAmount));
        onClearAmountError?.();
      } else if (num > channelLimits.maxAmount) {
        setAmount(channelLimits.maxAmount);
        setCustomAmountInput(String(channelLimits.maxAmount));
        onClearAmountError?.();
      }
    }
  };

  const liveAmountError = isFromCalculator
    ? amount < channelLimits.minAmount
      ? `Nominal ${labelType} minimal ${formatRupiah(channelLimits.minAmount)}`
      : amount > channelLimits.maxAmount
      ? `Batas maksimal transaksi ${channelLimits.label} adalah ${formatRupiah(channelLimits.maxAmount)}`
      : null
    : isCustomMode && customAmountInput !== "" && amount < channelLimits.minAmount
    ? `Nominal ${labelType} minimal ${formatRupiah(channelLimits.minAmount)}`
    : isCustomMode && amount > channelLimits.maxAmount
    ? `Batas maksimal transaksi ${channelLimits.label} adalah ${formatRupiah(channelLimits.maxAmount)}`
    : null;

  return {
    amount,
    setAmount,
    isCustomMode,
    setIsCustomMode,
    customAmountInput,
    setCustomAmountInput,
    selectedChannelId,
    setSelectedChannelId: handleSelectChannel,
    rawSetSelectedChannelId: setSelectedChannelId,
    channelLimits,
    selectedChannel,
    adminFee,
    totalPayment,
    liveAmountError,
    handlePresetClick,
    handleCustomModeClick,
    handleCustomInputChange,
    handleCustomInputBlur,
  };
}

