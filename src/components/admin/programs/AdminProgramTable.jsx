"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, ExternalLink, MoreVertical, Edit2, Play, Pause, CheckCircle, RefreshCw } from "lucide-react";
import { formatRupiah, calculateDaysLeft } from "@/lib/formatters";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { AdminProgramModal } from "./AdminProgramModal";
import { CreatableCombobox } from "@/components/ui/creatable-combobox";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/use-toast";

export function AdminProgramTable({
  initialCampaigns = [],
  categories = [],
}) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
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
    setSearch(e.target.value);
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[200px] max-w-sm">
            <Input
              leftIcon={Search}
              placeholder="Cari judul program donasi..."
              value={search}
              onChange={(e) => setSearch(sanitizeSearchQuery(e.target.value))}
              onClear={() => setSearch("")}
              className="h-10 text-sm bg-white"
            />
          </div>

          <CreatableCombobox
            options={filterCategoryOptions}
            value={categoryFilter}
            onChange={(val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            }}
            placeholder="Semua Kategori"
            searchPlaceholder="Cari kategori program..."
            emptyMessage="Kategori tidak ditemukan."
            className="h-10 w-44 text-sm bg-white shrink-0"
          />

          <Select
            value={statusFilter}
            onValueChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="h-10 w-36 text-sm bg-white shrink-0">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent align="start">
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="ACTIVE">Aktif</SelectItem>
              <SelectItem value="PAUSED">Terjeda</SelectItem>
              <SelectItem value="COMPLETED">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={refreshList}
            disabled={isLoading}
            className="h-10 w-10 rounded-lg border-slate-300 bg-white hover:bg-slate-50 cursor-pointer shrink-0 disabled:opacity-50"
            title="Segarkan data program"
            aria-label="Segarkan data program"
          >
            <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
          </Button>

          <Button
            type="button"
            onClick={handleOpenAdd}
            className="h-10 px-4 rounded-lg text-sm font-medium bg-primary hover:bg-primary-hover text-white flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Program baru</span>
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="min-w-[240px] font-medium text-slate-600 text-sm py-2.5">Program Donasi</TableHead>
                <TableHead className="w-32 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Kategori</TableHead>
                <TableHead className="w-48 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Capaian &amp; Target</TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Donatur &amp; Waktu</TableHead>
                <TableHead className="w-44 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Penyaluran Dana</TableHead>
                <TableHead className="w-24 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">Status</TableHead>
                <TableHead className="w-14 text-right font-medium text-slate-600 text-sm py-2.5">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedCampaigns && paginatedCampaigns.length > 0 ? (
                paginatedCampaigns.map((item) => {
                  const target = Number(item.targetAmount || 0);
                  const collected = Number(item.collectedAmount || 0);
                  const disbursed = Number(item.disbursedAmount || 0);
                  const remaining = Math.max(0, collected - disbursed);
                  const percent = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : null;
                  const daysLeft = item.endDate ? calculateDaysLeft(item.endDate) : null;

                  return (
                    <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="space-y-1 py-3 align-middle">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-medium text-sm text-slate-900 block leading-snug">
                            {item.title}
                          </span>
                          {item.isUrgent && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                              Mendesak
                            </span>
                          )}
                          {item.isFeatured && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                              Prioritas
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500 block">
                          Lokasi: {item.location}
                        </span>
                      </TableCell>

                      <TableCell className="py-3 align-middle text-center whitespace-nowrap">
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 max-w-[130px] truncate whitespace-nowrap" title={item.category}>
                          {item.category}
                        </span>
                      </TableCell>

                      <TableCell className="space-y-1.5 py-3 align-middle">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-900">{formatRupiah(collected)}</span>
                          {target > 0 && <span className="font-medium text-slate-600">{percent}%</span>}
                        </div>
                        {target > 0 && (
                          <>
                            <Progress value={percent} className="h-1.5" />
                            <span className="text-xs text-slate-500 block">
                              Target: {formatRupiah(target)}
                            </span>
                          </>
                        )}
                      </TableCell>

                      <TableCell className="text-sm text-slate-700 py-3 align-middle whitespace-nowrap">
                        <span className="font-medium text-slate-900">{item.donorCount}</span> donatur
                        {daysLeft !== null && (
                          <span className="text-xs text-slate-500 block mt-0.5">
                            {daysLeft > 0 ? `${daysLeft} hari lagi` : "Waktu berakhir"}
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="space-y-0.5 py-3 align-middle whitespace-nowrap">
                        {disbursed > 0 ? (
                          <>
                            <div className="font-medium text-sm text-slate-900">
                              {formatRupiah(disbursed)}
                            </div>
                            <span className="text-xs text-slate-500 block">
                              Sisa kas: {formatRupiah(remaining)}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="text-xs text-slate-400 block font-normal">
                              Belum disalurkan
                            </span>
                            <span className="text-xs text-slate-500 block">
                              Kas utuh: {formatRupiah(collected)}
                            </span>
                          </>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 align-middle text-center whitespace-nowrap">
                        {item.status === "ACTIVE" ? (
                          <span className="inline-flex items-center justify-center text-xs font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 max-w-[100px] truncate whitespace-nowrap">
                            Aktif
                          </span>
                        ) : item.status === "PAUSED" ? (
                          <span className="inline-flex items-center justify-center text-xs font-medium text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200 max-w-[100px] truncate whitespace-nowrap">
                            Terjeda
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200 max-w-[100px] truncate whitespace-nowrap">
                            Selesai
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right py-3.5 align-middle">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="p-1 rounded hover:bg-slate-100 text-slate-600 cursor-pointer outline-none">
                            <MoreVertical className="w-4.5 h-4.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 p-1">
                            <DropdownMenuItem
                              onClick={() => handleOpenEdit(item)}
                              className="text-sm py-2 cursor-pointer flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4 text-slate-600" />
                              <span>Sunting Program</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link
                                href={`/campaign/${item.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm py-2 cursor-pointer flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4 text-slate-600" />
                                <span>Buka di Website</span>
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {item.status === "ACTIVE" ? (
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(item.id, "PAUSED")}
                                className="text-sm py-2 cursor-pointer text-amber-700 flex items-center gap-2"
                              >
                                <Pause className="w-4 h-4" />
                                <span>Jeda Penggalangan</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(item.id, "ACTIVE")}
                                className="text-sm py-2 cursor-pointer text-emerald-700 flex items-center gap-2"
                              >
                                <Play className="w-4 h-4" />
                                <span>Aktifkan Kembali</span>
                              </DropdownMenuItem>
                            )}

                            {item.status !== "COMPLETED" && (
                              <DropdownMenuItem
                                onClick={() => handleToggleStatus(item.id, "COMPLETED")}
                                className="text-sm py-2 cursor-pointer text-slate-700 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>Tandai Selesai</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableEmptyRow colSpan={7} message="Tidak ada program donasi yang sesuai kriteria." />
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
      </div>

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
