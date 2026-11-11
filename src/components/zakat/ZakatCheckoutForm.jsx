"use client";

import { useZakatCheckout } from "./useZakatCheckout";
import { ZakatTypeSelector } from "./ZakatTypeSelector";
import { ZakatNiatCard } from "./ZakatNiatCard";
import { ZakatNominalInputSection } from "./ZakatNominalInputSection";
import { ZakatMuzakkiSection } from "./ZakatMuzakkiSection";
import { ZakatPaymentSummaryCard } from "./ZakatPaymentSummaryCard";
import { PaymentCategoryGroupList } from "@/components/donation/PaymentCategoryGroupList";
import { PendingInvoiceDialog } from "@/components/donation/PendingInvoiceDialog";
import { PAYMENT_CHANNELS } from "@/data/paymentChannels";
import { Card } from "@/components/ui/Card";

export function ZakatCheckoutForm({
  initialType = "ZAKAT_PENGHASILAN",
  initialAmount = 250000,
  targetCampaign = null,
}) {
  const {
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
  } = useZakatCheckout({
    initialType,
    initialAmount,
    targetCampaign,
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Kolom Kiri: Form Input & Akad (8 Kolom) */}
      <div className="lg:col-span-8 space-y-6">
        {/* 1. Pemilihan Jenis Zakat */}
        <Card className="p-5 sm:p-6 border-slate-200 bg-white shadow-2xs">
          <ZakatTypeSelector
            selectedTypeId={selectedTypeId}
            onSelectType={setSelectedTypeId}
          />
        </Card>

        {/* 2. Lafadz Niat & Doa Amil */}
        <ZakatNiatCard selectedTypeId={selectedTypeId} />

        {/* 3. Input Nominal Zakat */}
        <Card className="p-5 sm:p-6 border-slate-200 bg-white shadow-2xs">
          <ZakatNominalInputSection
            amount={amount}
            onChangeAmount={setAmount}
            error={errors.amount}
          />
        </Card>

        {/* 4. Data Identitas Muzakki */}
        <Card className="p-5 sm:p-6 border-slate-200 bg-white shadow-2xs">
          <ZakatMuzakkiSection
            salutation={salutation}
            setSalutation={setSalutation}
            isAnonymous={isAnonymous}
            setIsAnonymous={setIsAnonymous}
            muzakkiName={muzakkiName}
            setMuzakkiName={setMuzakkiName}
            muzakkiPhone={muzakkiPhone}
            setMuzakkiPhone={setMuzakkiPhone}
            muzakkiEmail={muzakkiEmail}
            setMuzakkiEmail={setMuzakkiEmail}
            muzakkiNpwp={muzakkiNpwp}
            setMuzakkiNpwp={setMuzakkiNpwp}
            prayer={prayer}
            setPrayer={setPrayer}
            errors={errors}
            setErrors={setErrors}
          />
        </Card>

        {/* 5. Kanal Pembayaran */}
        <Card className="p-5 sm:p-6 border-slate-200 bg-white shadow-2xs space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-medium text-slate-800">
              Pilih saluran pembayaran
            </h3>
            <p className="text-sm font-normal text-slate-500">
              Pilih metode pembayaran instan via QRIS atau Virtual Account bank resmi yayasan.
            </p>
          </div>

          <PaymentCategoryGroupList
            channels={PAYMENT_CHANNELS}
            selectedChannelId={selectedChannelId}
            onSelectChannel={setSelectedChannelId}
          />
        </Card>
      </div>

      {/* Kolom Kanan: Ringkasan Sticky (4 Kolom) */}
      <div className="lg:col-span-4">
        <ZakatPaymentSummaryCard
          selectedTypeId={selectedTypeId}
          amount={amount}
          selectedChannel={selectedChannel}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>

      {/* Dialog Konfirmasi Tagihan Aktif */}
      <PendingInvoiceDialog
        isOpen={pendingInvoiceModal.isOpen}
        onClose={() => setPendingInvoiceModal({ isOpen: false, invoice: null })}
        pendingInvoice={pendingInvoiceModal.invoice}
        onContinue={handleContinueExisting}
        onCreateNew={handleCreateNewAfterCancel}
      />
    </div>
  );
}

