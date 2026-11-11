/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Download, CalendarClock, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/useToast";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { formatRupiah, formatDate, formatPaymentChannel } from "@/lib/formatters";
import { formatRoutineSchedule } from "@/data/routineDonation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DonorRoutineManageModal } from "@/components/donor/DonorRoutineManageModal";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableSortHeader,
  TableEmptyRow,
  useTableSort,
} from "@/components/ui/Table";
import { safeFetch } from "@/lib/safeFetch";
import { DataFetchErrorState } from "@/components/shared/DataFetchErrorState";

export function DonorDashboardView({ currentUser: propUser }) {
  const { currentUser: hookUser } = useCurrentUser();
  const currentUser = propUser || hookUser;

  const [schedules, setSchedules] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [selectedRoutineForManage, setSelectedRoutineForManage] = useState(null);

  const handleRoutineStatusUpdated = (id, newStatus) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
  };

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
              channel: formatPaymentChannel(tx.paymentChannel || "QRIS"),
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
            <h2 className="text-base font-medium text-slate-900">Jadwal Donasi Rutin Anda</h2>
            <p className="text-sm text-slate-500 font-normal">Pengingat berkala untuk menjaga keistiqamahan sedekah.</p>
          </div>
          <Link href="/donasi-rutin">
            <Button size="sm" className="h-8 text-sm font-normal bg-primary hover:bg-primary-hover text-white cursor-pointer">
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
            <p className="text-sm text-slate-500 font-normal max-w-sm mx-auto">
              Buat jadwal otomatis atau pengingat WhatsApp harian/bulanan agar sedekah tetap terjaga istiqamah.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
            {schedules.map((sch) => (
              <div key={sch.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 block">{sch.program}</span>
                    <StatusBadge status={sch.status} />
                  </div>
                  <div className="flex items-center gap-3 text-sm font-normal text-slate-600">
                    <span>Jadwal: <span className="font-medium text-slate-800">{sch.freq}</span></span>
                    <span>Waktu Pengingat: <span className="font-medium text-primary">{sch.reminderTime} WIB</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-base font-medium text-slate-900 tabular-nums">{formatRupiah(sch.nominal)}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedRoutineForManage(sch)}
                    className="text-sm text-slate-600 hover:text-slate-900 font-normal underline cursor-pointer"
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
            <h2 className="text-base font-medium text-slate-900">Riwayat Transaksi &amp; Bukti Setor Zakat Resmi</h2>
            <p className="text-sm text-slate-500 font-normal">Unduh e-Kwitansi dengan QR Code sah untuk lampiran pajak.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8 w-8 rounded-lg border-slate-200 bg-white hover:bg-slate-50 cursor-pointer shrink-0 disabled:opacity-50"
            aria-label="Segarkan riwayat transaksi"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        <TableContainer>
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
                  label="Program donasi"
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
                <TableEmptyRow colSpan={6} message={isLoading ? "Memuat riwayat transaksi..." : "Belum ada data"} />
              ) : (
                sortedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-slate-700 font-normal font-mono text-sm align-middle">
                      <span className="block max-w-[130px] truncate">{tx.id}</span>
                    </TableCell>
                    <TableCell className="text-slate-600 font-normal text-sm whitespace-nowrap align-middle">{formatDate(tx.date)}</TableCell>
                    <TableCell className="font-medium text-slate-900 text-sm align-middle">
                      <span className="block max-w-[200px] truncate">{tx.program}</span>
                    </TableCell>
                    <TableCell className="font-medium text-emerald-800 text-right text-sm align-middle tabular-nums">{formatRupiah(tx.amount)}</TableCell>
                    <TableCell className="text-slate-600 font-normal text-sm align-middle">
                      <span className="block max-w-[130px] truncate">{tx.channel}</span>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <Link
                        href={`/invoice/${tx.id}`}
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-normal cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> e-Kwitansi
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Modal Dialog Aksi Kelola Donasi Rutin */}
      <DonorRoutineManageModal
        routine={selectedRoutineForManage}
        isOpen={Boolean(selectedRoutineForManage)}
        onClose={() => setSelectedRoutineForManage(null)}
        onStatusUpdated={handleRoutineStatusUpdated}
      />
    </div>
  );
}
