"use client";

import { InvoicePaymentStatusBanner } from "./InvoicePaymentStatusBanner";
import { InvoiceQrisSection } from "./InvoiceQrisSection";
import { InvoiceMandiriSection } from "./InvoiceMandiriSection";
import { InvoiceVirtualAccountSection } from "./InvoiceVirtualAccountSection";

/**
 * Payment method presentation coordinator (Headless Midtrans QRIS, BRI VA, or Mandiri Bill)
 *
 * @param {object} props
 * @param {object} props.donation
 * @param {boolean} props.copiedVa
 * @param {Function} props.onCopyVa
 */
export function InvoicePaymentMethod({ donation, copiedVa, onCopyVa }) {
  if (!donation) return null;

  // 1. Terminal payment status screens (PAID, EXPIRED, CANCELLED)
  if (["PAID", "EXPIRED", "CANCELLED"].includes(donation.status)) {
    return <InvoicePaymentStatusBanner donation={donation} />;
  }

  // 2. Determine channel type
  const isQris =
    donation.paymentChannelType === "QRIS" ||
    donation.paymentChannelId === "qris" ||
    donation.paymentChannelType === "EWALLET";
  const isMandiri = donation.paymentChannelId === "mandiri_va";
  const isVa =
    (donation.paymentChannelType === "VA" || String(donation.paymentChannelId).endsWith("_va")) &&
    !isMandiri;

  const billerCode = donation.billerCode || "70012";
  const billKey = donation.billKey || donation.virtualAccountNumber || "";
  const vaNumber = donation.virtualAccountNumber || "";
  const isDevelopment = process.env.NODE_ENV === "development";
  const effectiveSimulatorUrl = donation.qrCodeUrl || "";
  const showSimulatorTools =
    isDevelopment &&
    Boolean(effectiveSimulatorUrl) &&
    effectiveSimulatorUrl.includes("sandbox");

  return (
    <div className="space-y-5">
      {/* Header Channel */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold text-slate-900 truncate">
            {donation.paymentChannelName}
          </h2>
          <p className="text-sm text-slate-600 mt-0.5 line-clamp-1">
            {isQris
              ? "Scan kode QR via m-Banking atau E-Wallet."
              : isMandiri
              ? "Bayar via Multipayment di Livin' by Mandiri."
              : "Transfer ke nomor Virtual Account di bawah."}
          </p>
        </div>
        <span className="text-xs font-medium text-slate-600 px-2 py-0.5 rounded bg-slate-100 shrink-0 whitespace-nowrap">
          {donation.paymentChannelType === "EWALLET"
            ? "E-Wallet"
            : isQris
            ? "QRIS"
            : "VA"}
        </span>
      </div>

      {/* Konten Spesifik Kanal */}
      {isQris && (
        <InvoiceQrisSection
          donation={donation}
          effectiveSimulatorUrl={effectiveSimulatorUrl}
          showSimulatorTools={showSimulatorTools}
        />
      )}

      {isMandiri && (
        <InvoiceMandiriSection
          billerCode={billerCode}
          billKey={billKey}
        />
      )}

      {isVa && (
        <InvoiceVirtualAccountSection
          vaNumber={vaNumber}
          copiedVa={copiedVa}
          onCopyVa={onCopyVa}
        />
      )}
    </div>
  );
}
