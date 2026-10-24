"use client";

import { useState } from "react";
import Link from "next/link";
import { Pause, Play, XCircle } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import {
  DonorCard,
  DonorListItem,
  DonorListSkeleton,
  DonorEmptyText,
} from "@/components/donor/DonorDashboardPrimitives";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function DonorRoutineDonationsCard({
  routineDonations: initialItems = [],
  isLoading = false,
}) {
  const [items, setItems] = useState(initialItems);
  const [updatingId, setUpdatingId] = useState(null);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await safeFetch("/api/donor/routine-donations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) =>
          prev.map((it) => (it.id === id ? { ...it, status: newStatus } : it))
        );
        toast.success(data.message);
      } else {
        toast.error(data.message || "Gagal mengubah status donasi rutin.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui donasi rutin.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DonorCard
      title="Donasi Rutin Tersimpan"
      actionText={items.length > 0 ? "Atur jadwal" : undefined}
      actionHref="/donasi-rutin"
    >
      <div className="space-y-2.5">
        {isLoading ? (
          <DonorListSkeleton count={2} height="h-14" />
        ) : items.length === 0 ? (
          <DonorEmptyText message="Belum ada komitmen donasi rutin tersimpan" />
        ) : (
          items.map((item) => {
            const isProcessing = updatingId === item.id;
            const isActive = item.status === "ACTIVE";
            const isPaused = item.status === "PAUSED";
            const isCancelled = item.status === "CANCELLED";

            return (
              <DonorListItem key={item.id} className="flex-col items-start gap-2 p-3">
                <div className="w-full flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {item.frequency === "DAILY"
                          ? "Harian"
                          : item.frequency === "WEEKLY"
                          ? "Pekanan"
                          : "Bulanan"}
                      </span>
                      <StatusBadge status={item.status} />
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {item.programTitle}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-emerald-800">
                      {formatRupiah(item.amount)}
                    </p>
                    <span className="text-xs font-normal text-slate-400 block">
                      {item.routineType === "AUTO_DONATION"
                        ? "Auto-invoice"
                        : "Pengingat WA"}
                    </span>
                  </div>
                </div>

                {/* Tombol Aksi Mandiri Donatur */}
                {!isCancelled && (
                  <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5">
                    {isActive ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "PAUSED")}
                        disabled={isProcessing}
                        className="h-7 px-2.5 text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border-amber-200 gap-1"
                      >
                        <Pause className="w-3 h-3" />
                        <span>Jeda sementara</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "ACTIVE")}
                        disabled={isProcessing}
                        className="h-7 px-2.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 gap-1"
                      >
                        <Play className="w-3 h-3" />
                        <span>Lanjutkan donasi</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm(`Apakah Anda yakin ingin membatalkan komitmen donasi rutin ini?`)) {
                          handleUpdateStatus(item.id, "CANCELLED");
                        }
                      }}
                      disabled={isProcessing}
                      className="h-7 px-2.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border-rose-200 gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Batalkan</span>
                    </Button>
                  </div>
                )}
              </DonorListItem>
            );
          })
        )}
      </div>

      <Link href="/donasi-rutin" className="block pt-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full h-9 text-sm font-medium rounded-md border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
        >
          Atur donasi rutin baru
        </Button>
      </Link>
    </DonorCard>
  );
}
