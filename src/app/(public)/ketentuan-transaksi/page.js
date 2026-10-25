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
        imageAlt="Latar Belakang Ketentuan Donasi dan Transaksi Yayasan Payung Berkah"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8 sm:space-y-10 lg:space-y-12">
        <AkadTermsSection />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 items-start">
          <TransactionLimitTable
            title="Batas Transaksi Virtual Account (VA)"
            items={VA_TRANSACTION_LIMITS}
          />

          <TransactionLimitTable
            title="Batas Transaksi E-Wallet & QRIS"
            items={EWALLET_QRIS_TRANSACTION_LIMITS}
          />
        </div>
      </main>
    </div>
  );
}
