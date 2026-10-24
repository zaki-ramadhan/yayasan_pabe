import { getAdminTransactions } from "@/services/adminService";
import { AdminTransactionTable } from "@/components/admin/transactions/AdminTransactionTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Mutasi Transaksi Donasi",
  description: "Buku kas mutasi penerimaan donasi dan rekonsiliasi pembayaran Virtual Account serta QRIS yayasan.",
};

export default async function AdminTransactionPage() {
  const { items } = await getAdminTransactions({ limit: 50 });

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Mutasi Transaksi Donasi Masuk"
        description="Pantau riwayat pembayaran donasi dan status transaksi."
      />

      <AdminTransactionTable initialTransactions={items} />
    </div>
  );
}
