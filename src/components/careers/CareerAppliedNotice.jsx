"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRightUpIcon as ArrowUpRight } from "@solar-icons/react/line-duotone/arrow-right-up";
import { formatDate } from "@/lib/formatters";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";

const STATUS_CONFIG = {
  PENDING: {
    label: "Menunggu Peninjauan",
    labelColor: "text-amber-400",
    glowGradient: "rgba(180,83,9,0.45)",
    title: "Lamaran Anda Telah Terkirim",
    renderDesc: (date) => (
      <>
        Berkas lamaran posisi ini dikirim pada{" "}
        <span className="font-medium text-white">{date}</span>. Tim rekrutmen kami sedang meninjau kualifikasi Anda.
      </>
    ),
  },
  REVIEWED: {
    label: "Sedang Ditinjau",
    labelColor: "text-sky-400",
    glowGradient: "rgba(2,132,199,0.45)",
    title: "Berkas Sedang Ditinjau",
    renderDesc: () => "Tim rekrutmen kami sedang mempelajari berkas dan kualifikasi Anda untuk posisi ini.",
  },
  SHORTLISTED: {
    label: "Lolos Seleksi Berkas",
    labelColor: "text-emerald-400",
    glowGradient: "rgba(5,150,105,0.45)",
    title: "Selamat! Lolos Seleksi Berkas",
    renderDesc: () => "Kualifikasi Anda terpilih untuk melanjutkan ke tahap wawancara dan seleksi lanjutan.",
  },
  ACCEPTED: {
    label: "Lamaran Diterima",
    labelColor: "text-emerald-400",
    glowGradient: "rgba(5,150,105,0.45)",
    title: "Selamat! Anda Diterima",
    renderDesc: () => "Selamat bergabung sebagai bagian dari keluarga besar pengabdi Yayasan Payung Berkah.",
  },
  REJECTED: {
    label: "Belum Berhasil",
    labelColor: "text-rose-400",
    glowGradient: "rgba(225,29,72,0.45)",
    title: "Proses Seleksi Telah Selesai",
    renderDesc: () => "Terima kasih atas ketertarikan Anda. Saat ini kualifikasi Anda belum sesuai untuk posisi ini.",
  },
};

/**
 * Molecule component: Contextual banner atmosferik di preview lowongan jika posisi telah dilamar.
 * Format visual selaras dengan VolunteerPendingCard & banner atmosferik yayasan.
 * @param {object} props
 * @param {object} props.application
 * @param {Function} [props.onCancel]
 */
export function CareerAppliedNotice({ application, onCancel }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (!application) return null;

  const appliedDate = application.createdAt
    ? formatDate(application.createdAt)
    : "baru saja";

  const isPending = application.status === "PENDING";
  const config = STATUS_CONFIG[application.status] || STATUS_CONFIG.PENDING;

  const handleExecuteCancel = async () => {
    if (!onCancel || !application.id) return;
    try {
      setIsCancelling(true);
      await onCancel(application.id);
      setIsConfirmOpen(false);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <>
      <div className="pt-3.5 border-t border-slate-200">
        <div className="relative w-full overflow-hidden rounded-xl border border-slate-800 bg-slate-950 text-white p-4.5 sm:p-5 shadow-md">
          <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
            <Image
              src="/img/banners/covers/volunteer-cover.webp"
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-cover opacity-25 pointer-events-none select-none"
              draggable={false}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at bottom left, ${config.glowGradient} 0%, rgba(15,23,42,0.85) 55%, rgba(2,6,23,0.96) 100%)`,
              }}
            />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className={`text-xs font-medium ${config.labelColor}`}>
                Status: {config.label}
              </div>
              <h4 className="font-semibold text-white text-base sm:text-lg">
                {config.title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-200 max-w-md font-normal leading-relaxed">
                {config.renderDesc(appliedDate)}
              </p>

              <div className="pt-0.5">
                <Link
                  href="/donatur/karier"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-normal text-slate-200 hover:text-white hover:underline transition-colors"
                >
                  <span>Pantau di portal donatur</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300" />
                </Link>
              </div>
            </div>

            {isPending && onCancel && (
              <Button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="inline-flex items-center justify-center h-8.5 px-3.5 text-xs sm:text-sm font-medium rounded-lg bg-rose-600 hover:bg-rose-700 text-white shadow-2xs transition-colors cursor-pointer shrink-0 whitespace-nowrap self-start sm:self-auto select-none"
              >
                Batalkan lamaran
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteCancel}
        title="Batalkan pengajuan lamaran?"
        description={
          <>
            Apakah Anda yakin ingin menarik berkas lamaran untuk posisi{" "}
            <strong className="text-slate-900 font-semibold">
              {application.position || application.vacancy?.title || "lowongan ini"}
            </strong>
            ? Pengajuan ini akan dibatalkan, dan Anda dapat kembali memilih atau melamar lowongan lain yang diinginkan.
          </>
        }
        confirmLabel="Ya, batalkan"
        cancelLabel="Kembali"
        confirmVariant="destructive"
        isLoading={isCancelling}
      />
    </>
  );
}
