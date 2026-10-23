"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from "react";
import { FileText, Edit3 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatThousandsInput, parseThousandsToNumber } from "@/lib/formatters";

export function AdminAuditReportModal({
  report,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) {
  const isEdit = Boolean(report);
  const [year, setYear] = useState("");
  const [title, setTitle] = useState("");
  const [auditorName, setAuditorName] = useState("");
  const [opinionStatus, setOpinionStatus] = useState("WTP");
  const [totalFundsIn, setTotalFundsIn] = useState("");
  const [totalFundsOut, setTotalFundsOut] = useState("");
  const [beneficiaryCount, setBeneficiaryCount] = useState("");
  const [operationalRatio, setOperationalRatio] = useState("12.4%");
  const [pdfUrl, setPdfUrl] = useState("");
  const [summary, setSummary] = useState("");

  useEffect(() => {
    if (report) {
      setYear(String(report.year || ""));
      setTitle(report.title || "");
      setAuditorName(report.auditorName || "");
      setOpinionStatus(report.opinionStatus || "WTP");
      setTotalFundsIn(formatThousandsInput(report.totalFundsIn || 0));
      setTotalFundsOut(formatThousandsInput(report.totalFundsOut || 0));
      setBeneficiaryCount(formatThousandsInput(report.beneficiaryCount || 0));
      setOperationalRatio(report.operationalRatio || "12.4%");
      setPdfUrl(report.pdfUrl || "");
      setSummary(report.summary || "");
    } else {
      const currentYear = new Date().getFullYear();
      setYear(String(currentYear - 1));
      setTitle(`Laporan Keuangan & Audit Independen ${currentYear - 1}`);
      setAuditorName("");
      setOpinionStatus("WTP");
      setTotalFundsIn("");
      setTotalFundsOut("");
      setBeneficiaryCount("");
      setOperationalRatio("12.4%");
      setPdfUrl("");
      setSummary("Laporan keuangan menyajikan secara wajar, dalam semua hal yang material, posisi keuangan yayasan sesuai dengan Standar Akuntansi Keuangan di Indonesia.");
    }
  }, [report, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!year || !auditorName.trim()) return;

    onSubmit({
      ...(report ? { id: report.id } : {}),
      year: parseInt(year, 10),
      title: title.trim() || `Laporan Keuangan & Audit Tahun ${year}`,
      auditorName: auditorName.trim(),
      opinionStatus,
      totalFundsIn: parseThousandsToNumber(totalFundsIn),
      totalFundsOut: parseThousandsToNumber(totalFundsOut),
      beneficiaryCount: parseThousandsToNumber(beneficiaryCount),
      operationalRatio: operationalRatio.trim(),
      pdfUrl: pdfUrl.trim() || null,
      summary: summary.trim() || null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white border border-slate-200 shadow-xl rounded-xl p-5 max-h-[85vh] overflow-y-auto">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            {isEdit ? <Edit3 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            <DialogTitle className="text-base font-medium text-slate-900">
              {isEdit ? "Sunting laporan audit tahunan" : "Catat laporan audit tahunan baru"}
            </DialogTitle>
          </div>
          <p className="text-sm font-normal text-slate-500">
            Publikasikan laporan pertanggungjawaban transparansi keuangan dan opini audit independen yayasan.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800 block">
                Tahun buku laporan
              </label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2024"
                min={2015}
                max={2050}
                className="text-sm font-normal"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800 block">
                Opini audit independen
              </label>
              <Select value={opinionStatus} onValueChange={setOpinionStatus}>
                <SelectTrigger className="h-10 text-sm font-normal bg-white">
                  <SelectValue placeholder="Pilih opini" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WTP">WTP (Wajar Tanpa Pengecualian)</SelectItem>
                  <SelectItem value="WDP">WDP (Wajar Dengan Pengecualian)</SelectItem>
                  <SelectItem value="TMP">TMP (Tidak Menyatakan Pendapat)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800 block">
              Nama kantor akuntan publik / auditor independen
            </label>
            <Input
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              placeholder="Contoh: KAP Ahmad, Rasyid & Rekan (Registered Public Accountants)"
              className="text-sm font-normal"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800 block">
              Judul resmi laporan
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Laporan Audit Keuangan & Transparansi 2024"
              className="text-sm font-normal"
            />
          </div>

          {/* Angka Keuangan dengan Thousand Separator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800 block">
                Total penghimpunan dana (Rp)
              </label>
              <Input
                value={totalFundsIn}
                onChange={(e) => setTotalFundsIn(formatThousandsInput(e.target.value))}
                placeholder="0"
                className="text-sm font-normal"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800 block">
                Total penyaluran donasi (Rp)
              </label>
              <Input
                value={totalFundsOut}
                onChange={(e) => setTotalFundsOut(formatThousandsInput(e.target.value))}
                placeholder="0"
                className="text-sm font-normal"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800 block">
                Jumlah penerima manfaat (Jiwa)
              </label>
              <Input
                value={beneficiaryCount}
                onChange={(e) => setBeneficiaryCount(formatThousandsInput(e.target.value))}
                placeholder="0"
                className="text-sm font-normal"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-800 block">
                Rasio operasional yayasan
              </label>
              <Input
                value={operationalRatio}
                onChange={(e) => setOperationalRatio(e.target.value)}
                placeholder="Contoh: 12.4%"
                className="text-sm font-normal"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800 block">
              Tautan unduh berkas PDF laporan resmi
            </label>
            <Input
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://... atau /documents/audit-2024.pdf"
              className="text-sm font-normal"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-800 block">
              Ringkasan catatan auditor
            </label>
            <Textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Catatan ringkas opini dan transparansi..."
              rows={3}
              className="text-sm font-normal"
            />
          </div>

          <DialogFooter className="gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-10 px-4 text-sm font-normal cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !year || !auditorName.trim()}
              className="h-10 px-4 text-sm font-medium cursor-pointer"
            >
              {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan perubahan" : "Tambah laporan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
