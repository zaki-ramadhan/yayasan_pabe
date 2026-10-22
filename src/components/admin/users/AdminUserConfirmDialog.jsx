"use client";

import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function AdminUserConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi tindakan",
  description = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmLabel = "Ya, lanjutkan",
  confirmVariant = "destructive", // "destructive" | "primary"
  isLoading = false,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border border-slate-200">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-medium text-slate-900 leading-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-0.5">
                Tindakan ini akan langsung diterapkan ke sistem.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-slate-700 leading-relaxed py-2">
          {description}
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto px-3.5 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 ${
              confirmVariant === "destructive"
                ? "bg-rose-600 hover:bg-rose-700 text-white"
                : "bg-primary hover:bg-primary/90 text-white"
            }`}
          >
            {isLoading ? "Memproses..." : confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
