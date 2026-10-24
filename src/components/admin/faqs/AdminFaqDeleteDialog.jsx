"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AdminFaqDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  faq = null,
  isLoading = false,
}) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title="Hapus pertanyaan FAQ"
      confirmLabel={isLoading ? "Menghapus..." : "Hapus sekarang"}
      confirmVariant="destructive"
    >
      {faq && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-1 my-2">
          <span className="text-xs font-medium text-slate-500 block">Pertanyaan:</span>
          <p className="font-medium text-slate-900 leading-snug">
            {faq.question}
          </p>
        </div>
      )}
      <p className="text-xs text-slate-500 leading-relaxed">
        Tindakan ini permanen dan akan menghapus data tanya-jawab terkait dari database.
      </p>
    </ConfirmDialog>
  );
}
