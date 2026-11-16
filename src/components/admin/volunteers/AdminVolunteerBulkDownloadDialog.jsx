"use client";

import { useState, useRef, useMemo } from "react";
import JSZip from "jszip";
import { DownloadIcon as Download } from "@solar-icons/react/line-duotone/download";
import { ArchiveIcon as FileArchive } from "@solar-icons/react/line-duotone/archive";
import { CheckCircleIcon as CheckCircle2 } from "@solar-icons/react/line-duotone/check-circle";
import { DangerCircleIcon as AlertCircle } from "@solar-icons/react/line-duotone/danger-circle";
import { LoaderIcon as Loader2 } from "@solar-icons/react/linear/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { VolunteerIdCard } from "@/components/volunteer/VolunteerIdCard";
import {
  formatSafeFileName,
  renderCardElementToPng,
  triggerFileDownload,
} from "@/lib/volunteerCardExportHelper";
import { toast } from "@/hooks/useToast";

/**
 * Modal dialog untuk memproses unduh massal kartu relawan (Batch Export ZIP).
 * Merender sisi depan & belakang setiap relawan yang disetujui secara berurutan
 * dan mengemasnya ke dalam file ZIP terorganisir per folder relawan.
 */
export function AdminVolunteerBulkDownloadDialog({
  isOpen,
  onClose,
  selectedVolunteers = [],
  onComplete,
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentVolunteer, setCurrentVolunteer] = useState(null);
  const cancelRef = useRef(false);

  // Hanya relawan yang telah disetujui (APPROVED) yang memiliki kartu aktif
  const approvedList = useMemo(() => {
    return (selectedVolunteers || []).filter((v) => v.status === "APPROVED");
  }, [selectedVolunteers]);

  const total = approvedList.length;
  const progressPercent = total > 0 ? Math.round((currentIndex / total) * 100) : 0;

  const handleStartBulkExport = async () => {
    if (total === 0) {
      toast.error("Tidak ada relawan berstatus disetujui yang dipilih.");
      return;
    }

    setIsProcessing(true);
    setCurrentIndex(0);
    cancelRef.current = false;

    const zip = new JSZip();

    try {
      for (let i = 0; i < approvedList.length; i++) {
        if (cancelRef.current) {
          toast.info("Proses unduh massal dibatalkan.");
          break;
        }

        const vol = approvedList[i];
        setCurrentVolunteer(vol);
        setCurrentIndex(i + 1);

        // Tunggu siklus render DOM agar elemen kartu ter-update dengan data relawan saat ini
        await new Promise((resolve) => setTimeout(resolve, 150));

        const frontEl = document.getElementById("bulk-render-front")?.firstElementChild;
        const backEl = document.getElementById("bulk-render-back")?.firstElementChild;

        if (!frontEl || !backEl) {
          throw new Error(`Gagal merender elemen kartu untuk ${vol.fullName}`);
        }

        const [frontData, backData] = await Promise.all([
          renderCardElementToPng(frontEl),
          renderCardElementToPng(backEl),
        ]);

        // Buat folder teratur per relawan: "01_Budi-Santoso"
        const indexPrefix = String(i + 1).padStart(2, "0");
        const safeName = formatSafeFileName(vol.fullName);
        const folderName = `${indexPrefix}_${safeName}`;
        const personFolder = zip.folder(folderName);

        personFolder.file("Depan.png", frontData.split(",")[1], { base64: true });
        personFolder.file("Belakang.png", backData.split(",")[1], { base64: true });
      }

      if (!cancelRef.current) {
        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });

        const today = new Date().toISOString().slice(0, 10);
        const fileName = `Kartu-Relawan-Siap-Cetak-${today}.zip`;
        triggerFileDownload(zipBlob, fileName);

        toast.success(`Berhasil mengunduh ${total} paket kartu relawan siap cetak.`);
        onComplete?.();
        onClose();
      }
    } catch (err) {
      console.error("Gagal melakukan unduh massal kartu relawan:", err);
      toast.error("Terjadi kendala saat merender kartu relawan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
      setCurrentVolunteer(null);
      setCurrentIndex(0);
    }
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setIsProcessing(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : onClose}>
      <DialogContent className="sm:max-w-[440px] min-h-[280px] sm:min-h-[320px] max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="border-b border-slate-100 px-5 pt-5 pb-4">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 flex items-center gap-2">
            <FileArchive className="w-5 h-5 text-emerald-600" />
            <span>Unduh kartu siap cetak (ZIP)</span>
          </DialogTitle>
        </DialogHeader>

        {/* Node Render Tersembunyi (Sequential Buffer) */}
        <div
          className="fixed -left-[9999px] top-0 pointer-events-none p-6 bg-transparent w-[360px]"
          aria-hidden="true"
        >
          {currentVolunteer && (
            <>
              <div id="bulk-render-front">
                <VolunteerIdCard
                  volunteer={currentVolunteer}
                  mode="front"
                  rounded={false}
                />
              </div>
              <div id="bulk-render-back">
                <VolunteerIdCard
                  volunteer={currentVolunteer}
                  mode="back"
                  rounded={false}
                />
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-5 space-y-4 text-sm text-slate-700">
          {!isProcessing ? (
            <>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-normal text-slate-600">Total data terpilih:</span>
                  <span className="font-medium text-slate-900">{selectedVolunteers.length} relawan</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-normal text-slate-600">Kartu siap cetak (Disetujui):</span>
                  <span className="font-semibold text-emerald-700">{total} kartu</span>
                </div>
              </div>

              {selectedVolunteers.length > total && (
                <div className="flex items-start gap-2 p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Sebanyak <strong className="font-semibold">{selectedVolunteers.length - total} relawan berstatus menunggu/ditolak dilewati otomatis</strong> karena kartu identitasnya belum aktif.
                  </span>
                </div>
              )}

              <div className="text-xs text-slate-500 leading-relaxed">
                Setiap relawan akan dikemas dalam satu folder rapi berisikan file gambar <strong className="font-semibold text-slate-700">Depan.png</strong> dan <strong className="font-semibold text-slate-700">Belakang.png</strong> dengan rasio standar <strong className="font-semibold text-slate-700">CR80 PVC</strong> yang siap diserahkan ke vendor percetakan kartu.
              </div>
            </>
          ) : (
            <div className="py-3 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  Memproses {currentIndex} dari {total} kartu...
                </span>
                <span className="font-semibold text-slate-900 tabular-nums">{progressPercent}%</span>
              </div>

              <Progress value={progressPercent} className="h-2 w-full" />

              {currentVolunteer && (
                <p className="text-xs text-slate-500 truncate text-center pt-1">
                  Merender kartu: <strong>{currentVolunteer.fullName}</strong>
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t border-slate-100 px-5 py-3.5 bg-slate-50/50 flex flex-row items-center justify-end gap-2.5">
          {!isProcessing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="h-9 px-3.5 text-xs sm:text-sm font-medium text-slate-700 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleStartBulkExport}
                disabled={total === 0}
                className="h-9 px-4 text-xs sm:text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <Download className="w-4 h-4" />
                <span>Unduh {total} paket kartu (ZIP)</span>
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="h-9 px-4 text-xs sm:text-sm font-medium text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer"
            >
              Batalkan proses
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

