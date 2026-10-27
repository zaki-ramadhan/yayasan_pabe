"use client";

import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { NominalPresetsPicker } from "@/components/donation/NominalPresetsPicker";
import { PaymentChannelPicker } from "@/components/donation/PaymentChannelPicker";
import { DonorIdentitySection } from "@/components/donation/DonorIdentitySection";
import { DonationCheckoutSummary } from "@/components/donation/DonationCheckoutSummary";
import { useDonationCheckout, NOMINAL_PRESETS } from "./useDonationCheckout";

export function DonationCheckoutForm({ campaign, initialAmount = 50000, initialPrayer = "" }) {
  const {
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
  } = useDonationCheckout({ campaign, initialAmount, initialPrayer });

  if (isAuthChecking) {
    return (
      <div className="bg-white rounded-xl border border-slate-300 p-10 text-center space-y-3 max-w-lg mx-auto">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-slate-700">Memverifikasi sesi masuk donatur...</p>
      </div>
    );
  }

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
          error={errors.amount}
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
          isEmailLocked={isEmailLocked}
          errors={errors}
          setErrors={setErrors}
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
