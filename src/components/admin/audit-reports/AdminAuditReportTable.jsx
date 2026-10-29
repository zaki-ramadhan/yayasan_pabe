"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableEmptyRow,
} from "@/components/ui/Table";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { TableSelectionBar } from "@/components/ui/TableSelectionBar";
import { AdminAuditReportModal } from "./AdminAuditReportModal";
import { AdminAuditReportToolbar } from "./AdminAuditReportToolbar";
import { AdminAuditReportTableRow } from "./AdminAuditReportTableRow";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTableSelection } from "@/hooks/useTableSelection";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";

export function AdminAuditReportTable({ initialReports = [] }) {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const selection = useTableSelection(reports);

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
    selection.clearSelection();
    startTransition(() => {
      fetchReports(debouncedSearch);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleRefresh = () => {
    selection.clearSelection();
    startTransition(() => {
      fetchReports(debouncedSearch);
      toast.success("Daftar laporan audit berhasil dimuat ulang.");
    });
  };

  const handleSearchChange = (e) => {
    selection.clearSelection();
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

  const handleDelete = (rep) => {
    setReportToDelete(rep);
  };

  const handleConfirmDelete = async () => {
    if (!reportToDelete) return;

    try {
      setIsDeleting(true);
      const res = await safeFetch(`/api/admin/audit-reports?id=${reportToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Laporan audit berhasil dihapus.");
        setReports((prev) => prev.filter((r) => r.id !== reportToDelete.id));
        setReportToDelete(null);
      } else {
        toast.error(data.message || "Gagal menghapus laporan audit.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus laporan audit.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (selection.selectedCount === 0) return;
    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/audit-reports", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selection.selectedIds }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `${selection.selectedCount} laporan audit berhasil dihapus.`);
        const selectedSet = selection.selectedKeys;
        setReports((prev) => prev.filter((r) => !selectedSet.has(r.id)));
        selection.clearSelection();
        setIsBulkDeleteOpen(false);
      } else {
        toast.error(data.message || "Gagal menghapus laporan audit terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus laporan audit.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <AdminAuditReportToolbar
        search={search}
        onSearchChange={handleSearchChange}
        isPending={isPending}
        onRefresh={handleRefresh}
        onOpenCreate={handleOpenCreate}
      />

      {/* Reusable Bulk Action Bar */}
      <TableSelectionBar
        selectedCount={selection.selectedCount}
        totalCount={reports.length}
        label="laporan audit"
        onSelectAll={selection.selectAll}
        isAllSelected={selection.allSelected}
        onClearSelection={selection.clearSelection}
      >
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setIsBulkDeleteOpen(true)}
          className="font-medium h-8 text-xs gap-1.5 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Hapus {selection.selectedCount} laporan terpilih</span>
        </Button>
      </TableSelectionBar>

      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-12 text-center py-2.5 px-3">
                  <Checkbox
                    checked={selection.allSelected}
                    indeterminate={selection.isIndeterminate}
                    onCheckedChange={selection.toggleSelectAll}
                    aria-label="Pilih semua laporan audit di halaman ini"
                  />
                </TableHead>
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
                  colSpan={7}
                  isFiltered={Boolean(debouncedSearch)}
                />
              ) : (
                reports.map((item) => (
                  <AdminAuditReportTableRow
                    key={item.id}
                    item={item}
                    isSelected={selection.isSelected(item.id)}
                    onToggleSelect={selection.toggleSelect}
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

      <ConfirmDialog
        isOpen={Boolean(reportToDelete)}
        onClose={() => setReportToDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Hapus Laporan Audit"
        description={`Apakah Anda yakin ingin menghapus laporan audit tahun buku ${reportToDelete?.year}?`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        isLoading={isBulkDeleting}
        title={`Hapus ${selection.selectedCount} Laporan Audit`}
        description={`Apakah Anda yakin ingin menghapus ${selection.selectedCount} laporan audit terpilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus sekarang"
        confirmVariant="destructive"
      />
    </div>
  );
}
