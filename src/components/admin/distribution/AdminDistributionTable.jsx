"use client";

import { useState, useMemo } from "react";
import { Plus, Search, RefreshCw, Edit3, Trash2 } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/table";
import { AdminDistributionModal } from "./AdminDistributionModal";
import { AdminDistributionDeleteDialog } from "./AdminDistributionDeleteDialog";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "sonner";

export function AdminDistributionTable({
  initialDistributions = [],
  campaigns = [],
}) {
  const [distributions, setDistributions] = useState(initialDistributions);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState(null);
  const [deletingDistribution, setDeletingDistribution] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filtered = useMemo(() => {
    return distributions.filter((item) => {
      if (!debouncedSearch) return true;
      const term = debouncedSearch.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        (item.campaignTitle && item.campaignTitle.toLowerCase().includes(term))
      );
    });
  }, [distributions, debouncedSearch]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginatedDistributions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/distributions");
      const data = await res.json();
      if (data.success && data.data) {
        setDistributions(data.data);
        toast.success("Data rekam penyaluran berhasil diperbarui.");
      }
    } catch {
      toast.error("Gagal menyegarkan data penyaluran.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setSelectedDistribution(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedDistribution(item);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (item) => {
    setDeletingDistribution(item);
  };

  const handleConfirmDelete = async () => {
    if (!deletingDistribution?.id) return;
    setIsDeleting(true);
    try {
      const res = await safeFetch(`/api/admin/distributions/${deletingDistribution.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Rekam penyaluran berhasil dihapus.");
        setDistributions((prev) => prev.filter((d) => d.id !== deletingDistribution.id));
        setDeletingDistribution(null);
      } else {
        toast.error(data.message || "Gagal menghapus penyaluran.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus penyaluran.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Search & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="flex-1 max-w-md">
          <Input
            leftIcon={Search}
            placeholder="Cari program atau kegiatan penyaluran..."
            value={search}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            className="h-10 text-sm font-normal bg-white border-slate-300"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={refreshList}
            disabled={isLoading}
            className="h-10 px-3 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Penyaluran baru</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-72 font-medium text-slate-600 text-sm py-2.5">
                  Program donasi asal
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5">
                  Judul kegiatan &amp; berita
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Tanggal realisasi
                </TableHead>
                <TableHead className="w-40 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Dana tersalurkan
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedDistributions && paginatedDistributions.length > 0 ? (
                paginatedDistributions.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Program */}
                    <TableCell className="font-medium text-sm text-slate-900 py-3 align-middle">
                      {item.campaignTitle}
                    </TableCell>

                    {/* Judul & Konten */}
                    <TableCell className="space-y-1 py-3 align-middle">
                      <span className="font-medium text-sm text-slate-900 block leading-snug">
                        {item.title}
                      </span>
                      {item.content && (
                        <p className="text-xs text-slate-500 line-clamp-2 max-w-xl leading-relaxed font-normal">
                          {item.content}
                        </p>
                      )}
                    </TableCell>

                    {/* Tanggal */}
                    <TableCell className="text-sm text-slate-600 py-3 align-middle whitespace-nowrap">
                      {formatDate(item.date)}
                    </TableCell>

                    {/* Nominal */}
                    <TableCell className="text-right font-medium text-sm text-slate-900 py-3 align-middle whitespace-nowrap">
                      {formatRupiah(item.disbursedAmount)}
                    </TableCell>

                    {/* Aksi */}
                    <TableCell className="text-right py-3 whitespace-nowrap align-middle">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Sunting rekam penyaluran"
                          aria-label={`Sunting: ${item.title}`}
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(item)}
                          title="Hapus rekam penyaluran"
                          aria-label={`Hapus: ${item.title}`}
                          className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={5} message="Belum ada catatan rekam penyaluran." />
              )}
            </TableBody>
          </Table>
        </div>

        {filtered.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={filtered.length}
            limit={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Distribution Modal (Create/Edit) */}
      <AdminDistributionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        campaigns={campaigns}
        distributionToEdit={selectedDistribution}
        onSuccess={refreshList}
      />

      {/* Delete Confirmation Dialog */}
      <AdminDistributionDeleteDialog
        isOpen={Boolean(deletingDistribution)}
        onClose={() => setDeletingDistribution(null)}
        onConfirm={handleConfirmDelete}
        distribution={deletingDistribution}
        isLoading={isDeleting}
      />
    </div>
  );
}
