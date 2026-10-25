"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableEmptyRow,
  TablePaginationFooter,
} from "@/components/ui/table";
import { AdminDistributionModal } from "./AdminDistributionModal";
import { AdminDistributionDeleteDialog } from "./AdminDistributionDeleteDialog";
import { AdminDistributionToolbar } from "./AdminDistributionToolbar";
import { AdminDistributionTableRow } from "./AdminDistributionTableRow";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

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
      const res = await safeFetch("/api/admin/distributions?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setDistributions(data.data);
        toast.success("Data rekam penyaluran berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data penyaluran.");
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
      <AdminDistributionToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        isLoading={isLoading}
        onRefresh={refreshList}
        onOpenAdd={handleOpenAdd}
      />

      {/* Table Container */}
      <TableContainer>
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
                  <AdminDistributionTableRow
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                  />
                ))
              ) : (
                <TableEmptyRow colSpan={5} isFiltered={Boolean(debouncedSearch)} />
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
      </TableContainer>

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
