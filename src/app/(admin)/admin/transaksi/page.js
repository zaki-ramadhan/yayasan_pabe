import { getAdminTransactions } from "@/services/adminService";
import { AdminTransactionTable } from "@/components/admin/transactions/AdminTransactionTable";

export const metadata = {
  title: "Mutasi Transaksi Donasi",
  description: "Buku kas mutasi penerimaan donasi dan rekonsiliasi pembayaran Virtual Account serta QRIS yayasan.",
};

export default async function AdminTransactionPage() {
  const { items } = await getAdminTransactions({ limit: 50 });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
          Mutasi Transaksi Donasi Masuk
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pantau mutasi real-time dari seluruh metode pembayaran resmi, sinkronisasi otomatis, dan lacak status invoice.
        </p>
      </div>

      <AdminTransactionTable initialTransactions={items} />
    </div>
  );
}
