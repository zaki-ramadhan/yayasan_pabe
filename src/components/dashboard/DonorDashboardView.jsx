/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Download, CalendarClock, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { formatRoutineSchedule } from "@/data/routineDonation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableSortHeader,
  TableEmptyRow,
  useTableSort,
} from "@/components/ui/table";
import { safeFetch } from "@/lib/safeFetch";
import { DataFetchErrorState } from "@/components/shared/DataFetchErrorState";

export function DonorDashboardView({ currentUser: propUser }) {
  const { currentUser: hookUser } = useCurrentUser();
  const currentUser = propUser || hookUser;

  const [schedules, setSchedules] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const loadDonorData = useCallback(async () => {
    if (!currentUser?.email && !currentUser?.name) return;

    setIsLoading(true);
    setFetchError(null);
    try {
      const params = new URLSearchParams({
        mode: "dashboard",
        email: currentUser.email || "",
        name: currentUser.name || "",
      });

      const res = await safeFetch(`/api/user/donations?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        if (Array.isArray(json.data.routineDonations)) {
          setSchedules(
            json.data.routineDonations.map((sch) => ({
              id: sch.id,
              program: sch.programTitle || sch.campaign?.title || "Donasi Rutin",
              nominal: sch.amount,
              freq: formatRoutineSchedule(sch),
              status: sch.status || "ACTIVE",
              reminderTime: sch.reminderTime || "05:00",
            }))
          );
        }

        if (Array.isArray(json.data.recentItems)) {
          setTransactions(
            json.data.recentItems.map((tx) => ({
              id: tx.invoiceId,
              date: tx.paidAt || tx.createdAt,
              program: tx.campaign?.title || tx.donationType || "Donasi Umum",
              amount: tx.amount,
              channel: (tx.paymentChannel || "QRIS").toUpperCase(),
              status: tx.status,
            }))
          );
        }
      }
    } catch (err) {
      setFetchError(err.message || "Gagal memuat data dasbor donatur. Silakan periksa koneksi internet.");
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadDonorData();
  }, [loadDonorData]);

  const handleRefresh = async () => {
    await loadDonorData();
    toast.success("Data riwayat transaksi donatur berhasil diperbarui.");
  };

  const paidTransactions = transactions.filter((t) => t.status === "PAID");

  const {
    items: sortedTransactions,
    sortBy,
    sortOrder,
    handleSort,
  } = useTableSort(paidTransactions.length > 0 ? paidTransactions : transactions, {
    initialSortBy: "date",
    initialSortOrder: "desc",
  });

  return (
    <div className="space-y-6">
      {/* Active Recurring Schedules */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">Jadwal Donasi Rutin Anda</h2>
            <p className="text-xs text-slate-500">Pengingat berkala untuk menjaga keistiqamahan sedekah.</p>
          </div>
          <Link href="/donasi-rutin">
            <Button size="sm" className="h-8 text-xs bg-primary hover:bg-primary-hover text-white cursor-pointer">
              <Plus className="w-3.5 h-3.5 mr-1" /> Jadwal baru
            </Button>
          </Link>
        </div>

        {fetchError ? (
          <DataFetchErrorState
            title="Gagal Memuat Jadwal Rutin"
            message={fetchError}
            onRetry={loadDonorData}
            compact
          />
        ) : schedules.length === 0 ? (
          <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
            <CalendarClock className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-sm font-medium text-slate-700">Belum ada jadwal donasi rutin aktif</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Buat jadwal otomatis atau pengingat WhatsApp harian/bulanan agar sedekah tetap terjaga istiqamah.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {schedules.map((sch) => (
              <div key={sch.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 block">{sch.program}</span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      {sch.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span>Jadwal: <strong>{sch.freq}</strong></span>
                    <span>Waktu Pengingat: <strong className="text-primary">{sch.reminderTime} WIB</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-bold text-slate-950">{formatRupiah(sch.nominal)}</span>
                  <button
                    type="button"
                    onClick={() => toast.success("Jadwal pengingat telah tersinkronisasi.")}
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium underline cursor-pointer"
                  >
                    Kelola
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Donation History and e-Receipts */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-950">Riwayat Transaksi &amp; Bukti Setor Zakat Resmi</h2>
            <p className="text-xs text-slate-500">Unduh e-Kwitansi dengan QR Code sah untuk lampiran pajak.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 rounded-lg border-slate-200 bg-white hover:bg-slate-50 cursor-pointer shrink-0 disabled:opacity-50"
            title="Segarkan riwayat transaksi"
            aria-label="Segarkan riwayat transaksi"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <div className="rounded-lg border border-slate-200/90 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableSortHeader
                  label="No. Kwitansi / Invoice"
                  sortKey="id"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Tanggal"
                  sortKey="date"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Program / Akad"
                  sortKey="program"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Nominal"
                  sortKey="amount"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                />
                <TableSortHeader
                  label="Metode"
                  sortKey="channel"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableHead className="text-center font-medium text-slate-900 w-32">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetchError ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-4">
                    <DataFetchErrorState
                      title="Gagal Memuat Riwayat Transaksi"
                      message={fetchError}
                      onRetry={loadDonorData}
                      compact
                    />
                  </TableCell>
                </TableRow>
              ) : sortedTransactions.length === 0 ? (
                <TableEmptyRow colSpan={6} message={isLoading ? "Memuat riwayat transaksi..." : "Belum ada transaksi donasi"} />
              ) : (
                sortedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-slate-900 font-medium align-middle">{tx.id}</TableCell>
                    <TableCell className="text-slate-600 font-normal whitespace-nowrap align-middle">{formatDate(tx.date)}</TableCell>
                    <TableCell className="font-normal text-slate-800 align-middle">{tx.program}</TableCell>
                    <TableCell className="font-medium text-emerald-800 text-right align-middle">{formatRupiah(tx.amount)}</TableCell>
                    <TableCell className="text-slate-600 font-normal align-middle">{tx.channel}</TableCell>
                    <TableCell className="text-center align-middle">
                      <Link
                        href={`/invoice/${tx.id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> e-Kwitansi
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
