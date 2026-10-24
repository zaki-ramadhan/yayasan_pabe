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
import { AdminCategoryModal } from "./AdminCategoryModal";
import { AdminCategoryToolbar } from "./AdminCategoryToolbar";
import { AdminCategoryTableRow } from "./AdminCategoryTableRow";
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
      <AdminCategoryToolbar
        search={search}
        onSearchChange={setSearch}
        onClearSearch={() => setSearch("")}
        onRefresh={handleRefresh}
        onOpenCreate={handleOpenCreate}
        isPending={isPending}
      />

      <TableContainer>
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
                <TableEmptyRow
                  colSpan={4}
                  message="Belum ada kategori program yang cocok dengan pencarian."
                />
              ) : (
                categories.map((item) => (
                  <AdminCategoryTableRow
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
