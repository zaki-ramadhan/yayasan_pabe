"use client";

import { RestartIcon as RotateCcw } from "@solar-icons/react/line-duotone/restart";
import { CareerListItem } from "./CareerListItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";

/**
 * Organism component: Left master list of jobs
 * Mendukung loading skeleton, error handling, dan empty state.
 */
export function CareerMasterList({
  jobs = [],
  totalVacancies = 0,
  activeJobId,
  onSelectJob,
  onResetFilter,
  isLoading = false,
  error = null,
  onRetry,
  appliedJobIds = [],
  userApplications = [],
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
              className="p-4 sm:p-4.5 rounded-lg border border-slate-200 bg-white space-y-2 animate-pulse shadow-none"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="h-5 bg-slate-200 rounded w-44" />
                {idx === 1 && <div className="h-4 bg-slate-200 rounded w-16" />}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-3.5 bg-slate-100 rounded w-24" />
                <div className="h-3.5 bg-slate-100 rounded w-20" />
              </div>
              <div className="space-y-1 pt-1">
                <div className="h-3.5 bg-slate-100 rounded w-full" />
                <div className="h-3.5 bg-slate-100 rounded w-3/4" />
              </div>
              <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 flex items-center justify-between">
                <div className="h-3.5 bg-slate-100 rounded w-24" />
                <div className="h-3.5 bg-slate-100 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <EmptyState
          variant="dashed"
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
        totalVacancies === 0 ? (
          <EmptyState
            variant="dashed"
            title="Belum ada lowongan"
            description="Cek kembali secara berkala untuk posisi terbaru."
          />
        ) : (
          <EmptyState
            variant="dashed"
            title="Posisi tidak ditemukan"
            description="Coba ubah kata kunci atau filter."
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
        )
      ) : (
        <div className="space-y-2.5">
          {jobs.map((job) => {
            const userApp = (userApplications || []).find(
              (a) =>
                a.vacancyId === job.id ||
                a.vacancyDbId === job.id ||
                (job.dbId && (a.vacancyId === job.dbId || a.vacancyDbId === job.dbId))
            );
            const isApplied =
              Boolean(userApp) ||
              appliedJobIds.includes(job.id) ||
              (job.dbId && appliedJobIds.includes(job.dbId));

            return (
              <CareerListItem
                key={job.id}
                job={job}
                isSelected={job.id === activeJobId}
                onSelect={onSelectJob}
                isApplied={isApplied}
                application={userApp}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
