"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
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
import { AdminDistributionModal } from "./AdminDistributionModal";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";

export function AdminDistributionTable({
  initialDistributions = [],
  campaigns = [],
}) {
  const [distributions, setDistributions] = useState(initialDistributions);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    try {
      const res = await safeFetch("/api/admin/distributions");
      const data = await res.json();
      if (data.success && data.data) {
        setDistributions(data.data);
      }
    } catch {
      // silent
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar: Search & Action Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Input
            leftIcon={Search}
            placeholder="Cari program atau kegiatan penyaluran..."
            value={search}
            onChange={handleSearchChange}
            onClear={handleClearSearch}
            className="h-10 text-sm bg-white"
          />
        </div>

        <Button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-4 rounded-lg text-sm font-medium bg-primary hover:bg-primary-hover text-white flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Penyaluran Baru</span>
        </Button>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-72 font-medium text-slate-600 text-sm py-2.5">
                  Program Donasi Asal
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5">
                  Judul Kegiatan &amp; Berita
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5">
                  Tanggal Realisasi
                </TableHead>
                <TableHead className="w-40 text-right font-medium text-slate-600 text-sm py-2.5">
                  Dana Tersalurkan
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {paginatedDistributions && paginatedDistributions.length > 0 ? (
                paginatedDistributions.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="font-medium text-sm text-slate-900 py-3 align-top">
                      {item.campaignTitle}
                    </TableCell>

                    <TableCell className="space-y-1 py-3 align-top">
                      <span className="font-medium text-sm text-slate-900 block leading-snug">
                        {item.title}
                      </span>
                      {item.content && (
                        <p className="text-sm text-slate-500 line-clamp-2 max-w-xl leading-relaxed">
                          {item.content}
                        </p>
                      )}
                    </TableCell>

                    <TableCell className="text-sm text-slate-600 py-3 align-top whitespace-nowrap">
                      {formatDate(item.date)}
                    </TableCell>

                    <TableCell className="text-right font-semibold text-sm text-slate-900 py-3 align-top whitespace-nowrap">
                      {formatRupiah(item.disbursedAmount)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableEmptyRow colSpan={4} message="Belum ada catatan rekam penyaluran." />
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

      {/* Distribution Modal */}
      <AdminDistributionModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        campaigns={campaigns}
        onSuccess={refreshList}
      />
    </div>
  );
}
