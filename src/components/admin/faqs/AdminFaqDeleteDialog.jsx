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

export function AdminFaqDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  faq = null,
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
                Hapus pertanyaan FAQ
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-0.5">
                Pertanyaan ini tidak akan ditampilkan lagi di pusat bantuan publik.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {faq && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-1 my-1">
            <span className="text-sm font-medium text-slate-500 block">Pertanyaan:</span>
            <p className="font-medium text-slate-900 leading-snug">
              {faq.question}
            </p>
          </div>
        )}

        <p className="text-sm text-slate-500 leading-relaxed">
          Tindakan ini permanen dan akan menghapus data tanya-jawab terkait dari database.
        </p>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
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
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Menghapus..." : "Hapus sekarang"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
