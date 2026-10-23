"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Plus, Search, RefreshCw, Edit3, Trash2, FolderCheck } from "lucide-react";
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
import { AdminCategoryModal } from "./AdminCategoryModal";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/hooks/use-toast";
import { safeFetch } from "@/lib/safeFetch";

export function AdminCategoryTable({ initialCategories = [] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isInitialMount = useRef(true);

  const fetchCategories = async (searchTerm = search) => {
    try {
      const res = await safeFetch(`/api/admin/categories?search=${encodeURIComponent(searchTerm)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setCategories(json.data);
      }
    } catch {
      toast.error("Gagal memuat kategori program.");
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    startTransition(() => {
      fetchCategories(debouncedSearch);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleRefresh = () => {
    startTransition(() => {
      fetchCategories(debouncedSearch);
      toast.success("Daftar kategori berhasil dimuat ulang.");
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setSelectedCategory(cat);
    setModalOpen(true);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      const isEdit = Boolean(selectedCategory);
      const url = "/api/admin/categories";
      const method = isEdit ? "PUT" : "POST";

      const res = await safeFetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: selectedCategory.id, ...formData } : formData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setModalOpen(false);
        fetchCategories(debouncedSearch);
      } else {
        toast.error(data.message || "Gagal menyimpan kategori.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan kategori.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${cat.name}"?`)) {
      return;
    }

    try {
      const res = await safeFetch(`/api/admin/categories?id=${cat.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Kategori berhasil dihapus.");
        setCategories((prev) => prev.filter((c) => c.id !== cat.id));
      } else {
        toast.error(data.message || "Gagal menghapus kategori.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus kategori.");
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
            onClear={handleClearSearch}
            placeholder="Cari nama atau tautan (slug)..."
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
            <span>Tambah kategori</span>
          </Button>
        </div>
      </div>

      {/* Main Category Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="min-w-[220px] font-medium text-slate-600 text-sm py-2.5">
                  Nama kategori
                </TableHead>
                <TableHead className="min-w-[180px] font-medium text-slate-600 text-sm py-2.5">
                  Pengenal URL (slug)
                </TableHead>
                <TableHead className="w-36 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  Jumlah program
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap pr-4">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-40 text-center text-slate-500 font-normal text-sm">
                    Belum ada kategori program yang cocok dengan pencarian.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="py-3.5 align-middle font-medium text-sm text-slate-900">
                      <div className="flex items-center gap-2">
                        <FolderCheck className="w-4 h-4 text-primary shrink-0" />
                        <span>{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 align-middle text-sm font-mono text-slate-500 font-normal">
                      {item.slug}
                    </TableCell>
                    <TableCell className="text-center py-3.5 align-middle">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700">
                        {item.campaignCount} program
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-3.5 align-middle pr-4">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          title="Sunting kategori"
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          title="Hapus kategori"
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

      <AdminCategoryModal
        category={selectedCategory}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
