"use client";

import { useZakatCheckout, NOMINAL_PRESETS } from "./useZakatCheckout";
import { ZakatTypeSelector } from "./ZakatTypeSelector";
import { ZakatNiatCard } from "./ZakatNiatCard";
import { ZakatMuzakkiSection } from "./ZakatMuzakkiSection";
import { ZakatPaymentSummaryCard } from "./ZakatPaymentSummaryCard";
import { NominalPresetsPicker } from "@/components/donation/NominalPresetsPicker";
import { PaymentCategoryGroupList } from "@/components/donation/PaymentCategoryGroupList";
import { PendingInvoiceDialog } from "@/components/donation/PendingInvoiceDialog";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";

export function ZakatCheckoutForm({
  initialType = "ZAKAT_PENGHASILAN",
  initialAmount = 50000,
  targetCampaign = null,
  isFromCalculator = false,
}) {
  const {
    selectedTypeId,
    setSelectedTypeId,
    amount,
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
  } = useZakatCheckout({
    initialType,
    initialAmount,
    targetCampaign,
    isFromCalculator,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      <div className="lg:col-span-7 space-y-4">
        {!isFromCalculator && (
          <>
            <ZakatTypeSelector
              selectedTypeId={selectedTypeId}
              onSelectType={setSelectedTypeId}
            />
            <NominalPresetsPicker
              presets={NOMINAL_PRESETS}
              amount={amount}
              isCustomMode={isCustomMode}
              customAmountInput={customAmountInput}
              onPresetClick={handlePresetClick}
              onCustomModeClick={handleCustomModeClick}
              onCustomInputChange={handleCustomInputChange}
              onCustomInputBlur={handleCustomInputBlur}
              channelLimits={channelLimits}
              error={amountError}
              isZakat={true}
              step={null}
            />
          </>
        )}

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
          <ZakatMuzakkiSection
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
            muzakkiName={muzakkiName}
            setMuzakkiName={setMuzakkiName}
            muzakkiPhone={muzakkiPhone}
            setMuzakkiPhone={setMuzakkiPhone}
            muzakkiEmail={muzakkiEmail}
            setMuzakkiEmail={setMuzakkiEmail}
            isEmailLocked={isEmailLocked}
            muzakkiNpwp={muzakkiNpwp}
            setMuzakkiNpwp={setMuzakkiNpwp}
            prayer={prayer}
            setPrayer={setPrayer}
            errors={errors}
            setErrors={setErrors}
          />
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-300 space-y-4 shadow-xs">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">
              Pilih saluran pembayaran
            </h3>
            <p className="text-sm font-normal text-slate-600">
              Pilih metode pembayaran instan via QRIS atau Virtual Account bank resmi yayasan.
            </p>
          </div>

          {isFromCalculator && amountError && (
            <div className="p-3 rounded-lg border border-amber-300 bg-amber-50 text-xs sm:text-sm text-amber-800">
              {amountError}. Silakan pilih metode pembayaran <strong>Virtual Account</strong> untuk nominal zakat di atas Rp 10.000.000.
            </div>
          )}

          <PaymentCategoryGroupList
            channels={PAYMENT_CHANNELS}
            selectedChannelId={selectedChannelId}
            onSelectChannel={setSelectedChannelId}
          />
        </div>
      </div>

      <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
        <ZakatNiatCard selectedTypeId={selectedTypeId} />

        <ZakatPaymentSummaryCard
          selectedTypeId={selectedTypeId}
          amount={amount}
          selectedChannel={selectedChannel}
          isSubmitting={isSubmitting}
          isRedirecting={isRedirecting}
          onSubmit={handleSubmit}
          turnstileToken={turnstileToken}
          setTurnstileToken={setTurnstileToken}
          turnstileRef={turnstileRef}
        />
      </div>

      <PendingInvoiceDialog
        isOpen={pendingInvoiceModal.isOpen}
        onClose={() => setPendingInvoiceModal({ isOpen: false, invoice: null })}
        existingInvoice={pendingInvoiceModal.invoice}
        onContinueExisting={handleContinueExisting}
        onCreateNew={handleCreateNewAfterCancel}
        isCancelling={isCancellingOldInvoice}
        isZakat={true}
      />
    </div>
  );
}
