"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
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
      <DialogContent className="sm:max-w-md max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Kata sandi baru dibuat
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-3">
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

          <FormField label="Kata sandi sementara:">
            <div className="flex items-center justify-between bg-slate-100 border border-slate-300 rounded-lg p-2.5">
              <code className="text-sm font-medium font-mono text-slate-900 select-all tracking-wider">
                {data?.temporaryPassword}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="h-8 px-2.5 gap-1.5 bg-white text-slate-700 cursor-pointer"
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
              </Button>
            </div>
          </FormField>

          <p className="text-xs text-amber-700 bg-amber-50/80 border border-amber-200/60 rounded-md p-2.5 leading-relaxed">
            Kata sandi sementara ini hanya ditampilkan satu kali demi keamanan. Harap minta pengurus mengganti kata sandi setelah berhasil login.
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-9 min-w-[84px] w-full sm:w-auto cursor-pointer"
          >
            Selesai
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
