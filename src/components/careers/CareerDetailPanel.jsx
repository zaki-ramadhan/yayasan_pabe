"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { CareerDetailHeader } from "./CareerDetailHeader";
import { CareerDetailSection } from "./CareerDetailSection";
import { CareerChecklist } from "./CareerChecklist";
import { CareerDetailCta } from "./CareerDetailCta";
import { CareerAppliedNotice } from "./CareerAppliedNotice";
import { CareerApplyModal } from "./CareerApplyModal";

/**
 * Organism component: Right sticky panel displaying full job details
 * Fully decomposed into modular sub-components without redundant raw code.
 * @param {object} props
 * @param {object|null} props.job
 * @param {boolean} [props.hasVacancies]
 * @param {boolean} [props.isLoading]
 * @param {boolean} [props.isApplied]
 * @param {object|null} [props.appliedApplication]
 * @param {Function} [props.onApplySuccess]
 */
export function CareerDetailPanel({
  job,
  hasVacancies = true,
  isLoading = false,
  isApplied = false,
  appliedApplication = null,
  onApplySuccess,
  onCancelApplication,
}) {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  if (isLoading) {
    return (
      <Card className="rounded-xl p-5 sm:p-6 space-y-4 sm:space-y-5 bg-white border-slate-200 shadow-2xs animate-pulse">
        <div className="space-y-3 pb-4 border-b border-slate-100">
          <div className="h-6 bg-slate-200 rounded w-1/2"></div>
          <div className="flex flex-wrap gap-2.5 pt-1">
            <div className="h-4 bg-slate-100 rounded w-20"></div>
            <div className="h-4 bg-slate-100 rounded w-24"></div>
            <div className="h-4 bg-slate-100 rounded w-20"></div>
            <div className="h-4 bg-slate-100 rounded w-24"></div>
            <div className="h-4 bg-slate-100 rounded w-28"></div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-100 rounded w-1/3"></div>
          <div className="h-16 bg-slate-100/70 rounded w-full"></div>
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-slate-100 rounded w-1/4"></div>
          <div className="h-24 bg-slate-100/70 rounded w-full"></div>
        </div>
      </Card>
    );
  }

  if (!job) {
    return (
      <EmptyState
        variant="dashed"
        title={hasVacancies ? "Pilih posisi lowongan" : "Belum ada lowongan tersedia"}
        description={
          hasVacancies
            ? "Klik salah satu posisi di sebelah kiri untuk melihat detail."
            : "Rincian posisi dan pendaftaran akan tampil di sini."
        }
      />
    );
  }

  return (
    <>
      <Card className="rounded-xl p-5 sm:p-6 space-y-4 sm:space-y-5 bg-white border-slate-200 shadow-2xs">
        <CareerDetailHeader
          job={job}
          onApply={() => setIsApplyModalOpen(true)}
          isApplied={isApplied}
        />

        <CareerDetailSection title="Ringkasan Peran" className="-mt-4">
          <p className="text-sm font-normal text-slate-700 leading-relaxed">
            {job.overview}
          </p>
        </CareerDetailSection>

        <CareerDetailSection title="Tugas & Tanggung Jawab Utama">
          <CareerChecklist items={job.responsibilities} />
        </CareerDetailSection>

        <CareerDetailSection title="Kualifikasi & Persyaratan">
          <CareerChecklist items={job.requirements} />
        </CareerDetailSection>

        {job.benefits && job.benefits.length > 0 && (
          <CareerDetailSection title="Fasilitas & Lingkungan Kerja">
            <CareerChecklist items={job.benefits} />
          </CareerDetailSection>
        )}

        {isApplied ? (
          <CareerAppliedNotice
            application={appliedApplication}
            onCancel={onCancelApplication}
          />
        ) : (
          <CareerDetailCta
            applyUrl={job.applyUrl}
            deadline={job.deadline}
            onApply={() => setIsApplyModalOpen(true)}
          />
        )}
      </Card>

      <CareerApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={job}
        onSuccess={onApplySuccess}
      />
    </>
  );
}

