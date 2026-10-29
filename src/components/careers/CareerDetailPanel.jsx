"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { CareerDetailHeader } from "./CareerDetailHeader";
import { CareerDetailSection } from "./CareerDetailSection";
import { CareerChecklist } from "./CareerChecklist";
import { CareerDetailCta } from "./CareerDetailCta";
import { CareerApplyModal } from "./CareerApplyModal";

/**
 * Organism component: Right sticky panel displaying full job details
 * Fully decomposed into modular sub-components without redundant raw code.
 * @param {object} props
 * @param {object|null} props.job
 */
export function CareerDetailPanel({ job }) {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  if (!job) {
    return (
      <EmptyState
        variant="dashed"
        title="Belum ada posisi dipilih"
        description="Pilih salah satu lowongan di sebelah kiri untuk melihat rincian amanah, kualifikasi, dan batas lamaran."
      />
    );
  }

  return (
    <>
      <Card className="rounded-xl p-5 sm:p-6 space-y-4 sm:space-y-5 bg-white border-slate-200 shadow-2xs">
        {/* Header Section */}
        <CareerDetailHeader job={job} />

        {/* Deskripsi Amanah: Rapat dan terhubung langsung */}
        <CareerDetailSection title="Ringkasan Peran" className="-mt-4">
          <p className="text-sm font-normal text-slate-700 leading-relaxed">
            {job.overview}
          </p>
        </CareerDetailSection>

        {/* Tugas & Tanggung Jawab */}
        <CareerDetailSection title="Tugas & Tanggung Jawab Utama">
          <CareerChecklist items={job.responsibilities} />
        </CareerDetailSection>

        {/* Kualifikasi & Persyaratan */}
        <CareerDetailSection title="Kualifikasi & Persyaratan">
          <CareerChecklist items={job.requirements} />
        </CareerDetailSection>

        {/* Fasilitas & Benefit */}
        {job.benefits && job.benefits.length > 0 && (
          <CareerDetailSection title="Fasilitas & Lingkungan Kerja">
            <CareerChecklist items={job.benefits} />
          </CareerDetailSection>
        )}

        {/* Bottom Apply CTA */}
        <CareerDetailCta
          applyUrl={job.applyUrl}
          deadline={job.deadline}
          onApply={() => setIsApplyModalOpen(true)}
        />
      </Card>

      {/* Internal Application Dialog Modal */}
      <CareerApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={job}
      />
    </>
  );
}

