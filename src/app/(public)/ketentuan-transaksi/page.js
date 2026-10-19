import { InformationHeroHeader } from "@/components/shared/InformationHeroHeader";
import { TransactionLimitTable } from "@/components/transaction-terms/TransactionLimitTable";
import {
  VA_TRANSACTION_LIMITS,
  EWALLET_QRIS_TRANSACTION_LIMITS,
} from "@/data/transactionLimits";

export const metadata = {
  title: "Ketentuan Transaksi - Batas Minimum & Maksimum Donasi",
  description:
    "Informasi batas minimum dan maksimum transaksi donasi via Virtual Account dan QRIS guna mengedukasi donatur dan mencegah kejanggalan atau kesalahan dalam jumlah transaksi.",
};

export default function KetentuanTransaksiPage() {
  return (
    <div className="w-full">
      <InformationHeroHeader
        title="Ketentuan Transaksi"
        description="Informasi batas minimum dan maksimum transaksi donasi via Virtual Account dan QRIS guna mengedukasi donatur dan mencegah kekeliruan nominal transfer."
        imageAlt="Latar Belakang Ketentuan Transaksi Yayasan PABE"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6 sm:space-y-8">
        {/* Table 1: Virtual Account (VA) */}
        <TransactionLimitTable
          title="Virtual Account (VA)"
          items={VA_TRANSACTION_LIMITS}
        />

        {/* Table 2: E-Wallet & QRIS */}
        <TransactionLimitTable
          title="E-Wallet & QRIS"
          items={EWALLET_QRIS_TRANSACTION_LIMITS}
        />
      </main>
    </div>
  );
}
