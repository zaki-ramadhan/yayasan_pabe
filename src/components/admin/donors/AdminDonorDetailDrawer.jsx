"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { safeFetch } from "@/lib/safeFetch";
import { formatRupiah, formatDate, getInitials } from "@/lib/formatters";
import { maskEmail, maskPhone } from "@/lib/security";
import { toast } from "@/hooks/use-toast";

export function AdminDonorDetailDrawer({
  isOpen,
  onOpenChange,
  donor = null,
}) {
  const [history, setHistory] = useState({ donations: [] });
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!donor) return;
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (donor.email) params.set("email", donor.email);
      if (donor.phone) params.set("phone", donor.phone);
      if (donor.name) params.set("name", donor.rawName || donor.name);

      const res = await safeFetch(`/api/admin/donors/history?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.data || { donations: [] });
      }
    } catch {
      toast.error("Gagal memuat riwayat donasi.");
    } finally {
      setIsLoading(false);
    }
  }, [donor]);

  useEffect(() => {
    let ignore = false;
    if (isOpen && donor) {
      const load = async () => {
        if (!ignore) await fetchHistory();
      };
      load();
    } else {
      setHistory({ donations: [] });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, donor, fetchHistory]);

  if (!donor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        {/* Header */}
        <DialogHeader className="px-5 py-3.5 sm:px-6 border-b border-slate-100 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-base sm:text-lg font-semibold text-slate-900 leading-tight">
            Rincian donatur
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-4">
          {/* Identitas Donatur */}
          <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200/90 bg-slate-50/60">
            <Avatar className="w-10 h-10 rounded-full border border-slate-200 shrink-0 bg-white">
              {donor.avatar && <AvatarImage src={donor.avatar} alt={donor.name} />}
              <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-medium">
                {donor.name === "Hamba Allah" ? "HA" : getInitials(donor.name, "D")}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-semibold text-slate-900 leading-tight truncate">
                {donor.name}
              </h4>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Donasi pertama: {donor.firstDonatedAt ? formatDate(donor.firstDonatedAt) : "-"}
              </p>
            </div>
          </div>

          {/* Ringkasan Angka */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-xs font-normal text-slate-500 block">Total donasi</span>
              <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                {formatRupiah(donor.totalPaidAmount)}
              </span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 bg-white">
              <span className="text-xs font-normal text-slate-500 block">Frekuensi</span>
              <span className="text-sm font-semibold text-slate-900 block mt-0.5">
                {donor.paidCount} kali
              </span>
            </div>
          </div>

          {/* Kontak Donatur */}
          <div className="rounded-lg border border-slate-200 bg-white divide-y divide-slate-100 text-sm">
            <div className="p-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-normal shrink-0">Email</span>
              <span className="text-sm text-slate-800 font-normal truncate">
                {donor.email ? maskEmail(donor.email) : "-"}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 font-normal shrink-0">No. Telepon</span>
              <span className="text-sm text-slate-800 font-normal truncate tabular-nums">
                {donor.phone ? maskPhone(donor.phone) : "-"}
              </span>
            </div>
          </div>

          {/* Riwayat Donasi Terkini */}
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-slate-700 uppercase tracking-wider">
              Riwayat donasi
            </h5>

            {isLoading ? (
              <div className="py-6 text-center text-xs text-slate-500">Memuat riwayat...</div>
            ) : history.donations && history.donations.length > 0 ? (
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden">
                {history.donations.map((d) => (
                  <div key={d.id} className="p-3 flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0 space-y-0.5">
                      <span className="font-medium text-slate-900 text-xs block">
                        {d.invoiceId}
                      </span>
                      <p className="text-xs text-slate-600 truncate">
                        {d.campaignTitle}
                      </p>
                      <span className="text-xs text-slate-400 block font-normal">
                        {formatDate(d.paidAt || d.createdAt)}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-semibold text-slate-900 text-sm block">
                        {formatRupiah(d.totalAmount)}
                      </span>
                      <span className="text-xs text-slate-500 uppercase block font-normal">
                        {d.paymentChannel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                Belum ada transaksi donasi yang tercatat.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 min-w-[84px] cursor-pointer"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
