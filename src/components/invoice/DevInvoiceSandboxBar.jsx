"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BoltIcon as Zap } from "@solar-icons/react/line-duotone/bolt";
import { ClockCircleIcon as Clock } from "@solar-icons/react/line-duotone/clock-circle";
import { RestartIcon as RotateCcw } from "@solar-icons/react/line-duotone/restart";
import { ArrowRightUpIcon as ExternalLink } from "@solar-icons/react/linear/arrow-right-up";
import { CopyIcon as Copy } from "@solar-icons/react/line-duotone/copy";
import { CheckIcon as Check } from "@solar-icons/react/line-duotone/check";
import { CodeCircleIcon as Terminal } from "@solar-icons/react/line-duotone/code-circle";
import { CloseCircleIcon as XCircle } from "@solar-icons/react/line-duotone/close-circle";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { copyToClipboard } from "@/lib/clipboard";

/**
 * Panel alat bantu pengujian simulator khusus mode development (process.env.NODE_ENV === "development").
 * Memungkinkan pengujian transaksi (lunas, expired, reset) tanpa perlu switch ke akun Super Admin.
 */
export function DevInvoiceSandboxBar({ donation, onStatusChange }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!donation?.invoiceId) return null;

  const invoiceId = donation.invoiceId;
  const isPending = donation.status === "PENDING";
  const isPaid = donation.status === "PAID";
  const isExpired = donation.status === "EXPIRED";
  const isCancelled = donation.status === "CANCELLED";

  const isQris = donation.paymentChannelType === "QRIS" || donation.paymentChannelId === "qris";
  const isVirtualAccount =
    donation.paymentChannelType === "VA" ||
    String(donation.paymentChannelId).includes("va") ||
    Boolean(donation.virtualAccountNumber);

  const simulatorUrl = isQris
    ? "https://simulator.sandbox.midtrans.com/qris/index"
    : isVirtualAccount
    ? "https://simulator.sandbox.midtrans.com/openapi/va/index"
    : null;

  const simCopyValue = isQris
    ? donation.qrCodeUrl || ""
    : isVirtualAccount
    ? donation.virtualAccountNumber || donation.billKey || ""
    : "";

  const handleSimulate = async (action) => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/dev/simulate-donation-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, action }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        onStatusChange?.(data.status, data.paidAt);
        if (action === "SET_PAID" && typeof window !== "undefined") {
          const detail = {
            id: donation?.id || donation?.invoiceId,
            donor: donation?.donor || donation?.donorName || "Hamba Allah",
            amount: donation?.amount,
            campaignTitle: donation?.campaign?.title || donation?.campaignTitle || "Program Kebaikan Yayasan PABE",
          };
          window.dispatchEvent(new CustomEvent("pabe:new-donation", { detail }));
          try {
            if (typeof BroadcastChannel !== "undefined") {
              const bc = new BroadcastChannel("pabe_donations_channel");
              bc.postMessage(detail);
              bc.close();
            }
          } catch {}
        }
        router.refresh();
      } else {
        toast.error(data.message || "Gagal memproses simulasi status.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menjalankan simulasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopySimValue = async () => {
    if (!simCopyValue) return;
    const ok = await copyToClipboard(simCopyValue);
    if (ok) {
      setCopiedKey(true);
      toast.success(isQris ? "URL QR Simulator disalin!" : "Nomor VA Simulator disalin!");
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-4 sm:p-5 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500 text-white flex items-center justify-center shadow-2xs">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-sm font-bold text-amber-950 uppercase tracking-wider block">
              Sandbox Testing Simulator
            </span>
            <span className="text-sm text-amber-800 font-normal">
              Khusus mode pengembangan (Dev Mode) &bull; Status saat ini:{" "}
              <strong className="font-semibold">{donation.status}</strong>
            </span>
          </div>
        </div>
        <Badge variant="warning" className="capitalize shrink-0">
          Dev Only
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {!isPaid && (
          <Button
            type="button"
            size="sm"
            onClick={() => handleSimulate("PAID")}
            disabled={isLoading}
            isLoading={isLoading}
            className="h-8 px-3 text-xs font-semibold text-white bg-gradient-to-b from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-400 hover:via-emerald-500 hover:to-emerald-600 border-t border-t-emerald-300 border-x border-x-emerald-500 border-b-2 border-b-emerald-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(5,150,105,0.25)] active:translate-y-0.5 active:shadow-none rounded-lg gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {!isLoading && <Zap className="w-3.5 h-3.5 fill-current text-white" />}
            <span>Simulasi Bayar Lunas</span>
          </Button>
        )}

        {!isExpired && (
          <Button
            type="button"
            size="sm"
            onClick={() => handleSimulate("EXPIRED")}
            disabled={isLoading}
            isLoading={isLoading}
            className="h-8 px-3 text-xs font-semibold text-white bg-gradient-to-b from-rose-500 via-rose-600 to-rose-700 hover:from-rose-400 hover:via-rose-500 hover:to-rose-600 border-t border-t-rose-300 border-x border-x-rose-500 border-b-2 border-b-rose-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(225,29,72,0.25)] active:translate-y-0.5 active:shadow-none rounded-lg gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {!isLoading && <Clock className="w-3.5 h-3.5 text-white" />}
            <span>Simulasi Waktu Habis</span>
          </Button>
        )}

        {!isCancelled && (
          <Button
            type="button"
            size="sm"
            onClick={() => handleSimulate("CANCELLED")}
            disabled={isLoading}
            isLoading={isLoading}
            className="h-8 px-3 text-xs font-semibold text-white bg-gradient-to-b from-slate-500 via-slate-600 to-slate-700 hover:from-slate-400 hover:via-slate-500 hover:to-slate-600 border-t border-t-slate-300 border-x border-x-slate-500 border-b-2 border-b-slate-900 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_2px_4px_rgba(71,85,105,0.25)] active:translate-y-0.5 active:shadow-none rounded-lg gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {!isLoading && <XCircle className="w-3.5 h-3.5 text-white" />}
            <span>Simulasi Batal</span>
          </Button>
        )}

        {!isPending && (
          <Button
            type="button"
            variant="secondary3d"
            size="sm"
            onClick={() => handleSimulate("RESET_PENDING")}
            disabled={isLoading}
            isLoading={isLoading}
            className="h-8 px-3 text-xs font-medium text-slate-800 hover:text-slate-950 rounded-lg gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {!isLoading && <RotateCcw className="w-3.5 h-3.5 text-slate-600" />}
            <span>Reset ke Pending</span>
          </Button>
        )}

        {simulatorUrl && (
          <div className="flex items-center gap-1.5 ml-auto">
            {simCopyValue && (
              <Button
                type="button"
                variant="secondary3d"
                size="sm"
                onClick={handleCopySimValue}
                className="h-8 px-2.5 text-xs text-slate-700 gap-1.5 cursor-pointer rounded-lg"
                title={isQris ? "Salin URL gambar QR" : "Salin nomor Virtual Account"}
              >
                {copiedKey ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Disalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isQris ? "Salin QR URL" : "Salin No. VA"}</span>
                  </>
                )}
              </Button>
            )}

            <a
              href={simulatorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1 h-8 px-2.5 text-xs font-medium text-blue-800 bg-blue-100/80 hover:bg-blue-200/80 rounded-lg border border-blue-200 transition-colors"
            >
              <span>Midtrans Simulator</span>
              <ExternalLink className="w-3 h-3 text-blue-700" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
