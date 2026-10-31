"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { formatBytes } from "@/lib/formatters";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { useTableSelection } from "@/hooks/useTableSelection";

/**
 * Controller hook untuk state manajemen penyimpanan Cloudflare R2 dan pembersihan sampah.
 */
export function useAdminStorage({ initialOverview = null }) {
  const [overview, setOverview] = useState(initialOverview);
  const [prevInitial, setPrevInitial] = useState(initialOverview);

  // Pola resmi React: sinkronisasi state saat prop berubah tanpa useEffect cascading renders
  if (initialOverview !== prevInitial) {
    setPrevInitial(initialOverview);
    setOverview(initialOverview);
  }

  // Fungsi untuk memuat ulang status penyimpanan & rincian berkas R2 secara segar dari API
  const refreshOverview = useCallback(async () => {
    try {
      const res = await safeFetch("/api/admin/storage/overview");
      const json = await res.json();
      if (json.success && json.data) {
        setOverview(json.data);
      }
    } catch (err) {
      console.error("Gagal menyegarkan ringkasan penyimpanan R2:", err);
    }
  }, []);

  // Validasi otomatis: jika overview belum memiliki array files per folder, ambil dari API secara asinkron
  useEffect(() => {
    let isSubscribed = true;
    const hasFiles = overview?.folders?.some((f) => Array.isArray(f.files) && f.files.length > 0);
    if (overview?.isConfigured && overview.totalCount > 0 && !hasFiles) {
      safeFetch("/api/admin/storage/overview")
        .then((res) => res.json())
        .then((json) => {
          if (isSubscribed && json.success && json.data) {
            setOverview(json.data);
          }
        })
        .catch((err) => {
          console.error("Gagal mengambil rincian berkas penyimpanan R2:", err);
        });
    }
    return () => {
      isSubscribed = false;
    };
  }, [overview]);

  const [orphans, setOrphans] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isScanned, setIsScanned] = useState(false);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 300);

  const [folderFilter, setFolderFilter] = useState("ALL");
  const [ageFilter, setAgeFilter] = useState("0");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSearchChange = useCallback((valueOrEvent) => {
    const raw = typeof valueOrEvent === "string" ? valueOrEvent : valueOrEvent?.target?.value || "";
    const sanitized = sanitizeSearchQuery(raw).replace(/^\s+/, "");
    setSearch(sanitized);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearch("");
  }, []);

  const availableFolders = useMemo(() => {
    const set = new Set();
    (overview?.folders || []).forEach((f) => set.add(f.folder));
    orphans.forEach((o) => set.add(o.folder));
    return Array.from(set).filter((f) => f && f !== "ALL");
  }, [overview, orphans]);

  // Filter daftar orphan berdasarkan debounced search dan folder
  const filteredOrphans = useMemo(() => {
    return orphans.filter((item) => {
      if (folderFilter !== "ALL" && item.folder.toLowerCase() !== folderFilter.toLowerCase()) {
        return false;
      }
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        const matchKey = item.key.toLowerCase().includes(q);
        const matchFolder = item.folder.toLowerCase().includes(q);
        if (!matchKey && !matchFolder) return false;
      }
      return true;
    });
  }, [orphans, debouncedSearch, folderFilter]);

  // Hook seleksi tabel massal terpusat (SSOT)
  const selection = useTableSelection(filteredOrphans, {
    keyExtractor: (item) => item.key,
  });
  const { clearSelection } = selection;

  // Pemindaian berkas tak terpakai (Dry-Run Audit)
  const handleScan = useCallback(async (customAge) => {
    const ageParam = customAge !== undefined ? customAge : ageFilter;
    setIsScanning(true);
    try {
      const res = await safeFetch(`/api/admin/storage/scan?minAge=${ageParam}`);
      const json = await res.json();

      if (json.success) {
        const found = json.data?.orphans || [];
        setOrphans(found);
        clearSelection();
        setIsScanned(true);

        if (found.length > 0) {
          toast({
            variant: "warning",
            title: "Pemindaian selesai",
            description: `Ditemukan ${found.length} berkas sampah (${formatBytes(json.data.totalOrphanBytes)}) yang tidak digunakan.`,
          });
        } else {
          toast({
            variant: "success",
            title: "Penyimpanan bersih",
            description: "Tidak ditemukan berkas sampah. Seluruh berkas terpakai dengan baik.",
          });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Gagal memindai",
          description: json.message || "Terjadi kendala saat memeriksa penyimpanan berkas.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Koneksi gagal",
        description: "Gagal menghubungkan ke server untuk memindai berkas.",
      });
    } finally {
      setIsScanning(false);
    }
  }, [ageFilter, clearSelection]);

  const handleAgeFilterChange = useCallback((newAge) => {
    setAgeFilter(newAge);
    if (isScanned) {
      handleScan(newAge);
    }
  }, [isScanned, handleScan]);

  // Buka modal hapus satuan
  const handleOpenDeleteSingle = useCallback((item) => {
    setItemsToDelete([item]);
    setDeleteModalOpen(true);
  }, []);

  // Buka modal hapus banyak berkas terpilih
  const handleOpenDeleteSelected = useCallback(() => {
    if (selection.selectedItems.length === 0) return;
    setItemsToDelete(selection.selectedItems);
    setDeleteModalOpen(true);
  }, [selection.selectedItems]);

  // Eksekusi penghapusan permanen dari R2
  const handleConfirmDelete = useCallback(async () => {
    if (itemsToDelete.length === 0) return;

    setIsDeleting(true);
    try {
      const keys = itemsToDelete.map((item) => item.key);
      const res = await safeFetch("/api/admin/storage/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
      const json = await res.json();

      if (json.success) {
        const deletedSet = new Set(keys);
        setOrphans((prev) => prev.filter((item) => !deletedSet.has(item.key)));
        clearSelection();

        // Perbarui total overview secara instan di UI
        const freedBytes = itemsToDelete.reduce((sum, item) => sum + (item.size || 0), 0);
        setOverview((prev) => {
          if (!prev) return prev;
          const nextTotal = Math.max(0, prev.totalBytes - freedBytes);
          const nextCount = Math.max(0, prev.totalCount - itemsToDelete.length);
          const nextPercent = Number(((nextTotal / prev.limitBytes) * 100).toFixed(2));
          return {
            ...prev,
            totalBytes: nextTotal,
            totalCount: nextCount,
            usagePercent: nextPercent,
          };
        });

        // Muat ulang ringkasan penyimpanan agar berkas di tabel rincian folder ikut terupdate
        refreshOverview();

        toast({
          variant: "success",
          title: "Pembersihan berhasil",
          description: `${json.data?.deletedCount || keys.length} berkas tidak terpakai berhasil dibersihkan.`,
        });

        setDeleteModalOpen(false);
        setItemsToDelete([]);
      } else {
        toast({
          variant: "destructive",
          title: "Penghapusan gagal",
          description: json.message || "Gagal membersihkan berkas dari penyimpanan.",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Koneksi gagal",
        description: "Gagal mengirim permintaan pembersihan ke server.",
      });
    } finally {
      setIsDeleting(false);
    }
  }, [itemsToDelete, refreshOverview, clearSelection]);

  return {
    overview,
    refreshOverview,
    orphans: filteredOrphans,
    totalOrphansCount: orphans.length,
    isScanning,
    isScanned,
    search,
    setSearch,
    handleSearchChange,
    handleClearSearch,
    folderFilter,
    setFolderFilter,
    ageFilter,
    setAgeFilter,
    handleAgeFilterChange,
    availableFolders,
    deleteModalOpen,
    setDeleteModalOpen,
    itemsToDelete,
    isDeleting,
    handleScan,
    selection,
    selectedKeys: selection.selectedIds,
    handleToggleSelect: selection.toggleSelect,
    handleToggleSelectAll: selection.toggleSelectAll,
    handleOpenDeleteSingle,
    handleOpenDeleteSelected,
    handleConfirmDelete,
  };
}
