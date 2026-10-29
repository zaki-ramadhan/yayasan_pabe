"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Universal Reusable Confirmation & Destructive Action Dialog
 * Centralizes accessible dialog primitives and clean heading layout.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Konfirmasi tindakan",
  description = "Apakah Anda yakin ingin melanjutkan tindakan ini?",
  confirmLabel = "Ya, lanjutkan",
  confirmVariant = "destructive",
  cancelLabel = "Batal",
  children,
  isLoading = false,
  className = "",
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={cn(
          "sm:max-w-md min-h-[170px] sm:min-h-[190px] max-h-[85vh] overflow-hidden p-0 gap-0 bg-white border border-slate-200 flex flex-col",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6">
          {children ? (
            children
          ) : description ? (
            <div className="text-sm text-slate-600 leading-relaxed">
              {description}
            </div>
          ) : null}
        </div>

        <DialogFooter className="gap-2.5 sm:gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="w-full sm:w-auto min-w-[84px] h-9 whitespace-nowrap cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            disabled={isLoading}
            isLoading={isLoading}
            onClick={onConfirm}
            className="w-full sm:w-auto min-w-[96px] h-9 whitespace-nowrap cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed"
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

