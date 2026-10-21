import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";
import { AkadTermsSection } from "@/components/transaction-terms/AkadTermsSection";
import { TransactionLimitTable } from "@/components/transaction-terms/TransactionLimitTable";
import {
  VA_TRANSACTION_LIMITS,
  EWALLET_QRIS_TRANSACTION_LIMITS,
} from "@/data/transactionLimits";

export const metadata = {
  title: "Ketentuan Donasi & Transaksi",
  description:
    "Prinsip syariat akad wakalah donasi dan zakat, bukti penerbitan e-Kwitansi, serta informasi batas minimum dan maksimum transaksi via Virtual Account dan QRIS.",
};

export default function KetentuanTransaksiPage() {
  return (
    <div className="w-full">
      <InformationHeroHeader
        title="Ketentuan Donasi & Transaksi"
        description="Panduan akad syariah wakalah, tata kelola penyaluran donasi & zakat, serta batas minimum dan maksimum nominal transaksi resmi yayasan."
        imageAlt="Latar Belakang Ketentuan Donasi dan Transaksi Yayasan Generasi Sejahtera Mandiri"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* Section 1: Akad Wakalah & Ketentuan Donasi Syariah */}
        <AkadTermsSection />

        {/* Section 2: Virtual Account (VA) Limits */}
        <TransactionLimitTable
          title="Batas Transaksi Virtual Account (VA)"
          description="Batas minimum dan maksimum per transfer pembayaran donasi via bank transfer resmi."
          items={VA_TRANSACTION_LIMITS}
        />

        {/* Section 3: E-Wallet & QRIS Limits */}
        <TransactionLimitTable
          title="Batas Transaksi E-Wallet & QRIS"
          description="Standar Bank Indonesia dan batas pembayaran instan via dompet digital nasional."
          items={EWALLET_QRIS_TRANSACTION_LIMITS}
        />
      </main>
    </div>
  );
}
