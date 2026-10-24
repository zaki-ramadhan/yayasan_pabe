"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import {
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyRow,
} from "@/components/ui/table";
import { AdminAuditReportModal } from "./AdminAuditReportModal";
import { AdminAuditReportToolbar } from "./AdminAuditReportToolbar";
import { AdminAuditReportTableRow } from "./AdminAuditReportTableRow";
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
      <AdminAuditReportToolbar
        search={search}
        onSearchChange={handleSearchChange}
        isPending={isPending}
        onRefresh={handleRefresh}
        onOpenCreate={handleOpenCreate}
      />

      {/* Main Table */}
      <TableContainer>
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
                <TableEmptyRow
                  colSpan={6}
                  message="Belum ada laporan audit keuangan yang terdaftar."
                />
              ) : (
                reports.map((item) => (
                  <AdminAuditReportTableRow
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </TableContainer>

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
