"use client";

import { useState } from "react";
import { Send, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

/**
 * Modular action button to trigger routine donation invoice & WhatsApp notification testing.
 * @param {object} props
 * @param {string} [props.routineId] - Specific routine donation ID to trigger
 * @param {string} [props.routineType] - REMINDER_ONLY or AUTO_DONATION
 * @param {boolean} [props.isGlobal=false] - If true, triggers scheduler for all due routines
 * @param {Function} [props.onSuccess] - Callback when trigger succeeds
 */
export function AdminRoutineTriggerButton({
  routineId,
  routineType = "AUTO_DONATION",
  isGlobal = false,
  onSuccess,
}) {
  const [isTriggering, setIsTriggering] = useState(false);

  const handleTrigger = async () => {
    setIsTriggering(true);
    try {
      const payload = routineId ? { forceRoutineId: routineId } : {};
      const response = await fetch("/api/cron/routine-donations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal memproses pengiriman notifikasi.");
      }

      if (isGlobal) {
        if (data.processed === 0) {
          toast.info(
            "Cron aktif & terintegrasi: Tidak ada jadwal donatur yang jatuh tempo pada jam sekarang. Gunakan tombol tes di dalam dialog rincian donatur (ikon mata) untuk tes kirim langsung."
          );
        } else {
          toast.success(
            `Cron berhasil: ${data.succeeded || 0} terkirim, ${data.skipped || 0} dilewati, ${data.failed || 0} gagal.`
          );
        }
      } else {
        const detail = data.details?.[0];
        if (detail?.status === "QUEUED" || detail?.status === "SUCCESS") {
          toast.success(
            routineType === "AUTO_DONATION"
              ? `Invoice #${detail.invoiceId || ""} berhasil diproses & dikirim via WhatsApp!`
              : `Pengingat donasi berhasil diproses & dikirim via WhatsApp!`
          );
        } else if (detail?.status === "SKIPPED") {
          toast.info(detail.reason || "Jadwal ini sudah pernah diproses hari ini.");
        } else {
          toast.warning(detail?.error || "Proses selesai dengan catatan.");
        }
      }

      if (typeof onSuccess === "function") {
        onSuccess(data);
      }
    } catch (err) {
      toast.error(err.message || "Terjadi kesalahan saat memicu notifikasi.");
    } finally {
      setIsTriggering(false);
    }
  };

  if (isGlobal) {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleTrigger}
        disabled={isTriggering}
        className="h-10 gap-1.5 text-sm font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
        title="Jalankan pengecekan cron jadwal donasi rutin sekarang"
      >
        {isTriggering ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            <span>Memproses cron...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 text-emerald-600 fill-emerald-600/20" />
            <span>Tes jalankan cron</span>
          </>
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleTrigger}
      disabled={isTriggering}
      className="h-9 gap-1.5 text-xs font-medium text-slate-700 border-slate-300 hover:bg-slate-50 cursor-pointer"
    >
      {isTriggering ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          <span>Mengirim...</span>
        </>
      ) : (
        <>
          <Send className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tes kirim notifikasi & invoice</span>
        </>
      )}
    </Button>
  );
}
