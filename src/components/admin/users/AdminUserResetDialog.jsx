"use client";

import { useState } from "react";
import { Check, Copy, KeyRound } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { copyToClipboard } from "@/lib/clipboard";
import { toast } from "@/hooks/use-toast";

export function AdminUserResetDialog({
  isOpen,
  onClose,
  data,
}) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!data?.temporaryPassword) return;
    const ok = await copyToClipboard(data.temporaryPassword);
    if (ok) {
      setIsCopied(true);
      toast.success("Kata sandi sementara berhasil disalin.");
      setTimeout(() => setIsCopied(false), 2000);
    } else {
      toast.error("Gagal menyalin ke papan klip.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-medium text-slate-900 leading-tight">
                Kata sandi baru dibuat
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-0.5">
                Salin dan berikan kredensial ini kepada pengurus terkait.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 space-y-2 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Pengurus:</span>
              <span className="font-medium text-slate-900">{data?.userName || "-"}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Email:</span>
              <span className="font-medium text-slate-900 select-all">{data?.userEmail || "-"}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 block mb-1">
              Kata sandi sementara:
            </label>
            <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-lg p-2.5">
              <code className="text-sm font-medium font-mono text-slate-900 select-all tracking-wider">
                {data?.temporaryPassword}
              </code>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white text-slate-700 hover:text-slate-900 border border-slate-200 rounded-md transition-colors cursor-pointer"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-md p-2.5 leading-relaxed">
            Kata sandi sementara ini hanya ditampilkan satu kali demi keamanan. Harap minta pengurus mengganti kata sandi setelah berhasil login.
          </p>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Selesai
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
