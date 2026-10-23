"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Plus, Search, RefreshCw, Edit3, Trash2, ShieldCheck, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatNumber } from "@/lib/formatters";
import { AdminAuditReportModal } from "./AdminAuditReportModal";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/hooks/use-toast";
import { safeFetch } from "@/lib/safeFetch";

export function AdminAuditReportTable({ initialReports = [] }) {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isInitialMount = useRef(true);

  const fetchReports = async (searchTerm = search) => {
    try {
      const res = await safeFetch(`/api/admin/audit-reports?search=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReports(json.data);
      }
    } catch {
      toast.error("Gagal memuat laporan audit keuangan.");
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    startTransition(() => {
      fetchReports(debouncedSearch);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleRefresh = () => {
    startTransition(() => {
      fetchReports(debouncedSearch);
      toast.success("Daftar laporan audit berhasil dimuat ulang.");
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleOpenCreate = () => {
    setSelectedReport(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (rep) => {
    setSelectedReport(rep);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const isEdit = Boolean(selectedReport);
      const url = "/api/admin/audit-reports";
      const method = isEdit ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: selectedReport.id, ...formData } : formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setModalOpen(false);
        fetchReports(debouncedSearch);
      } else {
        toast.error(data.message || "Gagal menyimpan laporan audit.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan laporan audit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (rep) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus laporan audit tahun buku ${rep.year}?`)) {
      return;
    }

    try {
      const res = await safeFetch(`/api/admin/audit-reports?id=${rep.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Laporan audit berhasil dihapus.");
        setReports((prev) => prev.filter((r) => r.id !== rep.id));
      } else {
        toast.error(data.message || "Gagal menghapus laporan audit.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus laporan audit.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            value={search}
            onChange={handleSearchChange}
            placeholder="Cari tahun atau nama auditor..."
            leftIcon={Search}
            className="h-10 text-sm font-normal bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            title="Muat ulang data"
            className="h-10 px-3 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin text-primary" : ""}`} />
          </Button>

          <Button
            type="button"
            onClick={handleOpenCreate}
            className="h-10 px-4 text-sm font-medium gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah laporan audit</span>
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-28 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Tahun buku
                </TableHead>
                <TableHead className="min-w-[220px] font-medium text-slate-600 text-sm py-2.5">
                  Auditor independen &amp; judul
                </TableHead>
                <TableHead className="w-36 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Opini audit
                </TableHead>
                <TableHead className="w-56 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Penerimaan &amp; penyaluran
                </TableHead>
                <TableHead className="w-36 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Penerima manfaat
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap pr-4">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center text-slate-500 font-normal text-sm">
                    Belum ada laporan audit keuangan yang terdaftar.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="text-center py-3.5 align-middle">
                      <span className="font-medium text-sm text-slate-900 block">
                        {item.year}
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 align-middle space-y-1">
                      <span className="font-medium text-sm text-slate-900 block leading-tight">
                        {item.auditorName}
                      </span>
                      <span className="text-sm font-normal text-slate-500 block leading-normal">
                        {item.title}
                      </span>
                      {item.pdfUrl && (
                        <a
                          href={item.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-normal pt-0.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Unduh berkas PDF resmi</span>
                        </a>
                      )}
                    </TableCell>

                    <TableCell className="text-center py-3.5 align-middle">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/90 whitespace-nowrap">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.opinionStatus === "WTP" ? "Wajar (WTP)" : item.opinionStatus}</span>
                      </span>
                    </TableCell>

                    <TableCell className="py-3.5 align-middle space-y-1">
                      <div className="flex items-center justify-between text-sm font-normal">
                        <span className="text-slate-500">Masuk:</span>
                        <span className="font-medium text-slate-900 ml-2">{formatRupiah(item.totalFundsIn)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm font-normal">
                        <span className="text-slate-500">Salur:</span>
                        <span className="font-medium text-emerald-700 ml-2">{formatRupiah(item.totalFundsOut)}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-center py-3.5 align-middle space-y-0.5">
                      <span className="text-sm font-medium text-slate-900 block">
                        {formatNumber(item.beneficiaryCount)} jiwa
                      </span>
                      <span className="text-sm font-normal text-slate-500 block">
                        Rasio op: {item.operationalRatio || "-"}
                      </span>
                    </TableCell>

                    <TableCell className="text-right py-3.5 align-middle pr-4">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Sunting laporan"
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          title="Hapus laporan"
                          className="p-1.5 rounded-md text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AdminAuditReportModal
        report={selectedReport}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
