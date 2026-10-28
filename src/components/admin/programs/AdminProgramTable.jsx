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
import dynamic from "next/dynamic";

const AdminProgramModal = dynamic(
  () =>
    import("./AdminProgramModal").then(
      (m) => m.AdminProgramModal
    ),
  { ssr: false }
);
import { AdminProgramToolbar } from "./AdminProgramToolbar";
import { AdminProgramTableRow } from "./AdminProgramTableRow";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminProgramTable({
  initialCampaigns = [],
  categories = [],
  initialEditId,
}) {
  const initialEditCampaign = useMemo(() => {
    if (!initialEditId) return null;
    return (
      initialCampaigns.find(
        (c) => String(c.id) === String(initialEditId) || c.slug === initialEditId
      ) || null
    );
  }, [initialEditId, initialCampaigns]);

  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(Boolean(initialEditCampaign));
  const [editingCampaign, setEditingCampaign] = useState(initialEditCampaign);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const PAGE_SIZE = 10;

  const debouncedSearch = useDebounce(search.trim(), 300);

  const filterCategoryOptions = useMemo(() => {
    return [
      { value: "ALL", label: "Semua Kategori" },
      ...(categories || []).map((cat) => ({
        value: cat.id || cat.name,
        label: cat.name || cat.label,
      })),
    ];
  }, [categories]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((item) => {
      if (statusFilter !== "ALL" && item.status !== statusFilter) return false;
      if (categoryFilter !== "ALL") {
        const matchesId = item.categoryId === categoryFilter;
        const matchesName = item.category?.toLowerCase() === categoryFilter.toLowerCase();
        if (!matchesId && !matchesName) return false;
      }
      if (debouncedSearch && !item.title.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      return true;
    });
  }, [campaigns, statusFilter, categoryFilter, debouncedSearch]);

  const totalPages = Math.ceil(filteredCampaigns.length / PAGE_SIZE) || 1;
  const paginatedCampaigns = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCampaigns.slice(start, start + PAGE_SIZE);
  }, [filteredCampaigns, currentPage]);

  const handleSearchChange = (e) => {
    setSearch(sanitizeSearchQuery(e.target.value));
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setStatusFilter(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setCategoryFilter(val);
    setCurrentPage(1);
  };

  const refreshList = async () => {
    setIsLoading(true);
    try {
      const res = await safeFetch("/api/admin/programs?limit=100");
      const data = await res.json();
      if (data.success && data.data) {
        setCampaigns(data.data);
        toast.success("Data program donasi berhasil diperbarui.");
      } else {
        toast.error(data.message || "Gagal menyegarkan data program.");
      }
    } catch {
      toast.error("Gagal menyegarkan data program.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (campaign) => {
    setEditingCampaign(campaign);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (id, newStatus) => {
    try {
      const res = await safeFetch(`/api/admin/programs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Status program berhasil diubah ke ${newStatus}.`);
        setCampaigns((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
      } else {
        toast.error(data.message || "Gagal mengubah status program.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter Bar & Add Action */}
      <AdminProgramToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        categoryFilter={categoryFilter}
        onCategoryChange={handleCategoryChange}
        filterCategoryOptions={filterCategoryOptions}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onRefresh={refreshList}
        onOpenAdd={handleOpenAdd}
        isLoading={isLoading}
      />

      {/* Table Container */}
      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="min-w-[240px] font-medium text-slate-600 text-sm py-2.5">Program Donasi</TableHead>
                <TableHead className="w-32 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Kategori</TableHead>
                <TableHead className="w-56 min-w-[220px] font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Capaian &amp; Target</TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Donatur &amp; Waktu</TableHead>
                <TableHead className="w-44 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Penyaluran Dana</TableHead>
                <TableHead className="w-24 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Status</TableHead>
                <TableHead className="w-14 text-right font-medium text-slate-600 text-sm py-2.5">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedCampaigns && paginatedCampaigns.length > 0 ? (
                paginatedCampaigns.map((item) => (
                  <AdminProgramTableRow
                    key={item.id}
                    item={item}
                    onEdit={handleOpenEdit}
                    onToggleStatus={handleToggleStatus}
                  />
                ))
              ) : (
                <TableEmptyRow
                  colSpan={7}
                  isFiltered={Boolean(debouncedSearch || statusFilter !== "ALL" || categoryFilter !== "ALL")}
                />
              )}
            </TableBody>
          </Table>
        </div>

        {filteredCampaigns.length > 0 && (
          <TablePaginationFooter
            currentPage={currentPage}
            totalPages={totalPages}
            total={filteredCampaigns.length}
            limit={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        )}
      </TableContainer>

      {/* Program Modal (Add/Edit) */}
      <AdminProgramModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        campaignToEdit={editingCampaign}
        categories={categories}
        onSuccess={refreshList}
      />
    </div>
  );
}
