"use client";

import { SearchX, AlertCircle, RotateCcw } from "lucide-react";
import { CareerListItem } from "./CareerListItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";

/**
 * Organism component: Left master list of jobs
 * Mendukung loading skeleton, error handling, dan empty state.
 */
export function CareerMasterList({
  jobs = [],
  activeJobId,
  onSelectJob,
  onResetFilter,
  isLoading = false,
  error = null,
  onRetry,
}) {
  return (
    <div className="space-y-3">
      <div className="pb-0.5">
        <h2 className="text-lg font-medium text-slate-900">
          Daftar Posisi {isLoading ? "" : `(${jobs.length})`}
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 bg-white animate-pulse space-y-3"
            >
              <div className="h-5 bg-slate-200 rounded w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-4 bg-slate-100 rounded w-20"></div>
                <div className="h-4 bg-slate-100 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          variant="dashed"
          icon={AlertCircle}
          title="Gagal memuat daftar posisi"
          description={error}
          action={
            onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 text-sm font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Coba lagi</span>
              </Button>
            )
          }
        />
      ) : jobs.length === 0 ? (
        <EmptyState
          variant="dashed"
          icon={SearchX}
          title="Tidak ada posisi yang sesuai"
          description="Coba ubah kata kunci pencarian atau sesuaikan opsi filter lokasi dan divisi."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={onResetFilter}
              className="text-sm font-medium"
            >
              Reset Semua Filter
            </Button>
          }
        />
      ) : (
        <div className="space-y-2.5">
          {jobs.map((job) => (
            <CareerListItem
              key={job.id}
              job={job}
              isSelected={job.id === activeJobId}
              onSelect={onSelectJob}
            />
          ))}
        </div>
      )}
    </div>
  );
}
