"use client";

import { useState, useEffect, useTransition, useRef, useCallback } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";
import { useTableSelection } from "@/hooks/useTableSelection";

export function useAdminGallery({
  initialItems = [],
  initialPagination = {},
  initialCategories = [],
  initialEditId,
}) {
  const initialEditItem = initialEditId
    ? initialItems.find((item) => String(item.id) === String(initialEditId)) || null
    : null;

  const [items, setItems] = useState(initialItems);
  const [pagination, setPagination] = useState(initialPagination);
  const [categories, setCategories] = useState(initialCategories);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua Kategori");
  const [isPending, startTransition] = useTransition();

  const [modalOpen, setModalOpen] = useState(Boolean(initialEditItem));
  const [selectedItem, setSelectedItem] = useState(initialEditItem);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Bulk Selection & Deletion State
  const selection = useTableSelection(items);
  const { clearSelection } = selection;
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isInitialMount = useRef(true);

  const fetchItems = useCallback(
    async (page = 1, currentCategory = category, currentSearch = debouncedSearch) => {
      try {
        const query = new URLSearchParams({
          page: String(page),
          limit: "15",
          category: currentCategory,
          search: currentSearch,
        });

        const res = await safeFetch(`/api/admin/gallery?${query.toString()}`);
        const json = await res.json();

        if (json.success) {
          setItems(json.data || []);
          setPagination(json.pagination || {});
          clearSelection();
          if (json.categories) setCategories(json.categories);
        } else {
          toast.error(json.message || "Gagal memuat dokumentasi kegiatan.");
        }
      } catch {
        toast.error("Terjadi kendala jaringan saat memuat dokumentasi.");
      }
    },
    [category, debouncedSearch, clearSelection]
  );

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    startTransition(() => {
      fetchItems(1, category, debouncedSearch);
    });
  }, [category, debouncedSearch, fetchItems]);

  const handleRefresh = () => {
    startTransition(() => {
      fetchItems(pagination.page || 1, category, debouncedSearch);
      toast.success("Daftar dokumentasi berhasil dimuat ulang.");
    });
  };

  const handleSearchChange = (e) => {
    const val = typeof e === "string" ? e : e?.target?.value ?? "";
    setSearch(val);
  };

  const handleCategoryChange = (val) => {
    setCategory(val);
  };

  const handlePageChange = (newPage) => {
    startTransition(() => {
      fetchItems(newPage, category, debouncedSearch);
    });
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      const res = await safeFetch(`/api/admin/gallery/${itemToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Dokumentasi kegiatan berhasil dihapus.");
        setItemToDelete(null);
        fetchItems(pagination.page || 1, category, debouncedSearch);
      } else {
        toast.error(data.message || "Gagal menghapus dokumentasi kegiatan.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus dokumentasi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmBulkDelete = async () => {
    const ids = Array.from(selection.selectedIds);
    if (ids.length === 0) return;

    setIsBulkDeleting(true);
    try {
      const res = await safeFetch("/api/admin/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(`${ids.length} dokumentasi kegiatan berhasil dihapus.`);
        setIsBulkDeleteOpen(false);
        clearSelection();
        fetchItems(pagination.page || 1, category, debouncedSearch);
      } else {
        toast.error(data.message || "Gagal menghapus dokumentasi terpilih.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menghapus dokumentasi terpilih.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const isFiltered = Boolean(debouncedSearch || (category && category !== "Semua Kategori"));

  return {
    items,
    pagination,
    categories,
    search,
    category,
    isPending,
    modalOpen,
    setModalOpen,
    selectedItem,
    setSelectedItem,
    handleOpenCreate,
    handleOpenEdit,
    itemToDelete,
    setItemToDelete,
    isDeleting,
    isFiltered,
    fetchItems,
    handleRefresh,
    handleSearchChange,
    handleCategoryChange,
    handlePageChange,
    handleDeleteConfirm,
    selection,
    isBulkDeleteOpen,
    setIsBulkDeleteOpen,
    isBulkDeleting,
    handleConfirmBulkDelete,
  };
}
