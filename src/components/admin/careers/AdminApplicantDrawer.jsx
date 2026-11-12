"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { useAdminApplicants } from "./useAdminApplicants";
import { AdminApplicantToolbar } from "./AdminApplicantToolbar";
import { AdminApplicantItem } from "./AdminApplicantItem";

/**
 * Layout Coordinator Modal untuk Daftar Pelamar Lowongan Karier.
 */
export function AdminApplicantDrawer({
  isOpen,
  onOpenChange,
  vacancy = null,
}) {
  const vacancyId = vacancy?.id;

  const {
    applications,
    isLoading,
    isLoadingMore,
    updatingId,
    hasMore,
    totalCount,
    sortBy,
    statusFilter,
    handleSortChange,
    handleStatusFilterChange,
    handleLoadMore,
    handleStatusChange,
  } = useAdminApplicants({ isOpen, vacancyId });

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        {/* Header Modal */}
        <DialogHeader className="border-b border-slate-100">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-950">
            Daftar pelamar: {vacancy?.title || "Lowongan"}{" "}
            {totalCount > 0 ? `(${applications.length} dari ${totalCount})` : ""}
          </DialogTitle>
        </DialogHeader>

        {/* Sub-bar Filter & Urutan */}
        <AdminApplicantToolbar
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          sortBy={sortBy}
          onSortChange={handleSortChange}
        />

        {/* List Pelamar dengan Scroll & Divider Bersih */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-6 divide-y divide-slate-100">
          {isLoading ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center gap-2 text-sm text-slate-600">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
              <span>Memuat data pelamar...</span>
            </div>
          ) : applications.length > 0 ? (
            applications.map((app) => (
              <AdminApplicantItem
                key={app.id}
                application={app}
                isUpdating={updatingId === app.id}
                onStatusChange={handleStatusChange}
              />
            ))
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center text-sm text-slate-500 font-normal">
              {statusFilter !== "ALL"
                ? "Pelamar tidak ditemukan."
                : "Belum ada lamaran masuk."}
            </div>
          )}

          {/* Tombol Paginasi Tambahan */}
          {hasMore && (
            <div className="pt-3 pb-4 text-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="w-full text-sm font-normal py-2.5 border-dashed text-slate-700 hover:text-slate-900 border-slate-300 bg-slate-50 hover:bg-slate-100"
              >
                {isLoadingMore ? (
                  <span className="inline-flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memuat berkas pelamar lainnya...
                  </span>
                ) : (
                  `Muat lebih banyak (tersisa ${Math.max(0, totalCount - applications.length)} pelamar)`
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Footer Modal */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 min-w-[84px] w-full sm:w-auto text-sm font-normal text-slate-700 hover:text-slate-900"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
