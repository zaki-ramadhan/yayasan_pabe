"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Copy, Check, RefreshCw } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import { toast } from "@/hooks/use-toast";
import { copyToClipboard } from "@/lib/clipboard";
import { safeFetch } from "@/lib/safeFetch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";

export function AdminRecentTransactionsCard({
  initialTransactions = [],
  maxRows = 7,
  scrollable = false,
}) {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch(`/api/admin/transactions?limit=${maxRows}`);
      const data = await res.json();
      if (data.success && data.data) {
        setTransactions(data.data);
        toast.success("Mutasi donasi terkini berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data transaksi.");
      }
    } catch {
      toast.error("Gagal menyegarkan data transaksi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyInvoice = async (invoiceId) => {
    if (!invoiceId) return;
    const success = await copyToClipboard(invoiceId);
    if (success) {
      setCopiedId(invoiceId);
      toast.success(`Nomor invoice ${invoiceId} berhasil disalin.`);
      setTimeout(() => {
        setCopiedId((prev) => (prev === invoiceId ? null : prev));
      }, 2000);
    } else {
      toast.error("Gagal menyalin nomor invoice.");
    }
  };

  return (
    <Card className="shadow-2xs overflow-hidden h-full flex flex-col">
      <CardHeader className="p-3.5 sm:p-4 border-b border-slate-200/90 flex flex-row items-center justify-between gap-3 space-y-0">
        <div>
          <CardTitle className="text-base font-semibold text-slate-900 leading-tight">
            Mutasi Donasi Masuk Terkini
          </CardTitle>
          <CardDescription className="text-sm text-slate-500 mt-0.5">
            Pencatatan kas masuk real-time seluruh metode pembayaran
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={refreshList}
            disabled={isLoading}
            className="h-8 w-8 text-slate-600 hover:bg-slate-50"
            title="Segarkan transaksi terkini"
            aria-label="Segarkan transaksi terkini"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <Link
            href="/admin/transaksi"
            className="text-sm font-medium text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Semua transaksi</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </CardHeader>

      <div className={`overflow-x-auto flex-1 ${scrollable ? "max-h-[380px] overflow-y-auto" : ""}`}>
        <Table>
          <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
            <TableRow>
              <TableHead className="w-[170px] font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Invoice</TableHead>
              <TableHead className="w-px font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Donatur</TableHead>
              <TableHead className="w-full font-medium text-slate-600 text-sm py-2.5 min-w-[160px]">Program</TableHead>
              <TableHead className="w-px font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Nominal</TableHead>
              <TableHead className="w-px text-center font-medium text-slate-600 text-sm py-1.5 leading-tight whitespace-nowrap">
                Metode<br />Pembayaran
              </TableHead>
              <TableHead className="w-px text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100">
            {transactions && transactions.length > 0 ? (
              transactions.slice(0, maxRows).map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <TableCell className="w-[170px] text-sm py-3 align-middle">
                    <div className="flex items-center gap-1.5 w-full min-w-0 max-w-[160px]">
                      <span
                        className="font-medium text-slate-900 truncate block select-all"
                        title={item.invoiceId}
                      >
                        {item.invoiceId}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyInvoice(item.invoiceId)}
                        title="Salin nomor invoice"
                        aria-label={`Salin invoice ${item.invoiceId}`}
                        className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedId === item.invoiceId ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="w-px text-sm font-medium text-slate-900 py-3 whitespace-nowrap align-middle">
                    {item.donorName}
                  </TableCell>
                  <TableCell className="text-sm text-slate-700 py-3 align-middle">
                    <span className="line-clamp-2 leading-snug font-normal text-slate-800 block">{item.campaignTitle}</span>
                  </TableCell>
                  <TableCell className="w-px text-sm font-medium text-slate-900 py-3 whitespace-nowrap align-middle">
                    {formatRupiah(item.amount)}
                  </TableCell>
                  <TableCell className="w-px text-center py-3 whitespace-nowrap uppercase align-middle">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 border border-slate-200 text-slate-700 max-w-[110px] truncate whitespace-nowrap">
                      {item.paymentChannel}
                    </span>
                  </TableCell>
                  <TableCell className="w-px text-center py-3 whitespace-nowrap align-middle">
                    <StatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableEmptyRow colSpan={6} />
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
