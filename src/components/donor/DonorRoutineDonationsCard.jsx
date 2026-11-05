"use client";

import { useState } from "react";
import Link from "next/link";
import { Pause, Play, XCircle } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import {
  DonorCard,
  DonorListItem,
  DonorRoutineListSkeleton,
  DonorEmptyText,
} from "@/components/donor/DonorDashboardPrimitives";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

export function DonorRoutineDonationsCard({
  routineDonations: initialItems = [],
  isLoading = false,
}) {
  const [items, setItems] = useState(initialItems);
  const [updatingId, setUpdatingId] = useState(null);
  const [cancelCommitmentItem, setCancelCommitmentItem] = useState(null);

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

  const hasActiveRoutine = items.some(
    (it) => it.status === "ACTIVE" || it.status === "PAUSED"
  );

  return (
    <DonorCard
      title="Donasi Rutin Tersimpan"
    >
      <div className="space-y-2.5">
        {isLoading ? (
          <DonorRoutineListSkeleton count={1} />
        ) : items.length === 0 ? (
          <DonorEmptyText message="Belum ada komitmen donasi rutin tersimpan" />
        ) : (
          items.map((item) => {
            const isProcessing = updatingId === item.id;
            const isActive = item.status === "ACTIVE";
            const isPaused = item.status === "PAUSED";
            const isCancelled = item.status === "CANCELLED";

            return (
              <DonorListItem key={item.id} className="flex-col items-start gap-2.5 p-3 sm:p-3.5">
                {/* 1. Header: Frekuensi, Status, dan Nominal */}
                <div className="w-full flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {item.frequency === "DAILY"
                        ? "Harian"
                        : item.frequency === "WEEKLY"
                        ? "Pekanan"
                        : "Bulanan"}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm sm:text-base font-bold text-emerald-800 tabular-nums">
                      {formatRupiah(item.amount)}
                    </p>
                  </div>
                </div>

                {/* 2. Body: Judul Program Lebar Penuh (Line Clamp 2) & Tipe Penagihan */}
                <div className="w-full space-y-1">
                  <p
                    className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2"
                    title={item.programTitle}
                  >
                    {item.programTitle}
                  </p>
                  <p className="text-xs text-slate-500">
                    {item.routineType === "AUTO_DONATION"
                      ? "Penagihan via invoice email"
                      : "Pengingat jadwal via email"}
                  </p>
                </div>

                {/* 3. Footer: Tombol Aksi Mandiri Donatur (Gaya 3D Embossed) */}
                {!isCancelled && (
                  <div className="w-full pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                    {isActive ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "PAUSED")}
                        disabled={isProcessing}
                        isLoading={isProcessing}
                        className="h-7 px-2.5 text-xs font-medium text-white bg-gradient-to-b from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:via-amber-500 hover:to-amber-600 border-t border-t-amber-300 border-x border-x-amber-600 border-b-2 border-b-amber-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(217,119,6,0.25)] active:translate-y-0.5 active:shadow-none rounded-md gap-1.5 cursor-pointer disabled:pointer-events-none disabled:opacity-60"
                      >
                        {!isProcessing && <Pause className="w-3 h-3 text-white fill-current" />}
                        <span>Jeda</span>
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleUpdateStatus(item.id, "ACTIVE")}
                        disabled={isProcessing}
                        isLoading={isProcessing}
                        className="h-7 px-2.5 text-xs font-medium text-white bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:via-emerald-600 hover:to-emerald-700 border-t border-t-emerald-400 border-x border-x-emerald-600 border-b-2 border-b-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(5,150,105,0.25)] active:translate-y-0.5 active:shadow-none rounded-md gap-1.5 cursor-pointer disabled:pointer-events-none disabled:opacity-60"
                      >
                        {!isProcessing && <Play className="w-3 h-3 text-white fill-current" />}
                        <span>Lanjutkan</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setCancelCommitmentItem(item)}
                      disabled={isProcessing}
                      isLoading={isProcessing}
                      className="h-7 px-2.5 text-xs font-medium text-white bg-gradient-to-b from-rose-600 via-rose-700 to-rose-800 hover:from-rose-500 hover:via-rose-600 hover:to-rose-700 border-t border-t-rose-400 border-x border-x-rose-600 border-b-2 border-b-rose-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_4px_rgba(225,29,72,0.25)] active:translate-y-0.5 active:shadow-none rounded-md gap-1.5 cursor-pointer disabled:pointer-events-none disabled:opacity-60"
                    >
                      {!isProcessing && <XCircle className="w-3 h-3 text-white" />}
                      <span>Batalkan</span>
                    </Button>
                  </div>
                )}
              </DonorListItem>
            );
          })
        )}
      </div>

      {!hasActiveRoutine && (
        <Link href="/donasi-rutin" className="block pt-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-sm font-medium rounded-md border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 cursor-pointer"
          >
            {items.length === 0 ? "Atur donasi rutin" : "Atur donasi rutin baru"}
          </Button>
        </Link>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelCommitmentItem)}
        onClose={() => setCancelCommitmentItem(null)}
        onConfirm={async () => {
          if (!cancelCommitmentItem) return;
          const id = cancelCommitmentItem.id;
          setCancelCommitmentItem(null);
          await handleUpdateStatus(id, "CANCELLED");
        }}
        isLoading={updatingId === cancelCommitmentItem?.id}
        title="Batalkan Donasi Rutin"
        description="Apakah Anda yakin ingin membatalkan komitmen donasi rutin ini? Anda dapat mendaftar kembali kapan saja."
        confirmLabel="Ya, batalkan"
        confirmVariant="destructive"
      />
    </DonorCard>
  );
}
