"use client";

import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function AdminUserConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  type = null,
  targetUser = null,
  title,
  confirmLabel,
  confirmVariant,
  isLoading = false,
  isSubmitting = false,
}) {
  const isDelete = type === "delete";
  const isSuspend = type === "suspend";
  const isActive = targetUser?.isActive;

  const computedTitle =
    title ||
    (isDelete
      ? "Hapus akun pengurus"
      : isSuspend
      ? isActive
        ? "Tangguhkan akun pengurus"
        : "Aktifkan kembali akun"
      : "Konfirmasi tindakan");

  const computedConfirmLabel =
    confirmLabel ||
    (isDelete
      ? "Hapus sekarang"
      : isSuspend
      ? isActive
        ? "Tangguhkan akun"
        : "Aktifkan akun"
      : "Ya, lanjutkan");

  const computedVariant =
    confirmVariant || (isDelete || (isSuspend && isActive) ? "destructive" : "default");
  const loadingState = isLoading || isSubmitting;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={loadingState}
      title={computedTitle}
      confirmLabel={loadingState ? "Memproses..." : computedConfirmLabel}
      confirmVariant={computedVariant}
    >
      {targetUser && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 space-y-1.5 my-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-normal">Nama pengurus:</span>
            <span className="font-medium text-slate-900">{targetUser.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-normal">Email:</span>
            <span className="font-medium text-slate-900">{targetUser.email}</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200">
            <span className="text-xs text-slate-500 font-normal">Peran:</span>
            <span className="font-medium text-slate-900">{targetUser.role}</span>
          </div>
        </div>
      )}
      <p className="text-xs text-slate-500 leading-relaxed">
        {isDelete
          ? "Tindakan ini permanen dan akan menghapus akses staf terkait dari sistem."
          : isSuspend && isActive
          ? "Akun pengurus akan dinonaktifkan sementara dan tidak dapat masuk ke sistem."
          : "Akun pengurus akan diaktifkan kembali dan dapat masuk ke panel sistem."}
      </p>
    </ConfirmDialog>
  );
}

