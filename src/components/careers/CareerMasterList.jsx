"use client";

import { SearchX } from "lucide-react";
import { CareerListItem } from "./CareerListItem";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/Button";

/**
 * Organism component: Left master list of jobs
 * Reuses existing EmptyState and Button primitives instead of custom duplicates.
 * @param {object} props
 * @param {Array} props.jobs
 * @param {string|null} props.activeJobId
 * @param {Function} props.onSelectJob
 * @param {Function} props.onResetFilter
 */
export function CareerMasterList({
  jobs = [],
  activeJobId,
  onSelectJob,
  onResetFilter,
}) {
  return (
    <div className="space-y-3">
      <div className="pb-0.5">
        <h2 className="text-lg font-medium text-slate-900">
          Daftar Posisi ({jobs.length})
        </h2>
      </div>

      {jobs.length === 0 ? (
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
