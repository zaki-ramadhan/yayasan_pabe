"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useTableSelection } from "@/hooks/useTableSelection";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";
import { useAdminLiveEvent } from "@/hooks/useAdminLiveFeed";

export function useAdminPrayerModeration({
  initialData = { prayers: [], total: 0, totalPages: 1, currentPage: 1 },
}) {
  const [prayers, setPrayers] = useState(initialData.prayers || []);
  const [total, setTotal] = useState(initialData.total || 0);
  const [totalPages, setTotalPages] = useState(initialData.totalPages || 1);
  const [currentPage, setCurrentPage] = useState(initialData.currentPage || 1);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [campaignFilter, setCampaignFilter] = useState("ALL");
  const [togglingId, setTogglingId] = useState(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const selection = useTableSelection(prayers);

  const debouncedSearch = useDebounce(search.trim(), 350);
  const isInitialMount = useRef(true);

  // Live SSE: Menerima doa donatur baru saat donasi berhasil terbayar secara real-time
  useAdminLiveEvent("DONATION_PAID", (payload) => {
    if (!payload?.prayer) return;
    setPrayers((prev) => {
      if (prev.some((p) => p.id === payload.id)) return prev;
      const newPrayer = {
        id: payload.id,
        donorName: payload.donorName || "Hamba Allah",
        prayer: payload.prayer,
        amount: payload.amount || 0,
        createdAt: payload.paidAt || payload.createdAt || new Date().toISOString(),
        isPrayerHidden: Boolean(payload.isPrayerHidden),
        isPrayerPinned: Boolean(payload.isPrayerPinned),
        campaignTitle: payload.campaignTitle || "Donasi Umum",
        campaignSlug: payload.campaignSlug || "",
      };
      return [newPrayer, ...prev];
    });
    setTotal((prev) => prev + 1);
    toast.info(`Doa kebaikan baru masuk dari ${payload.donorName || "Donatur"}`);
  });

  useAdminLiveEvent("DONATION_UPDATED", (payload) => {
    if (!payload?.id) return;
    if (payload.previousStatus === "PAID" && payload.status !== "PAID") {
      setPrayers((prev) => {
        const exists = prev.some((p) => p.id === payload.id);
        if (!exists) return prev;
        setTotal((t) => Math.max(0, t - 1));
        return prev.filter((p) => p.id !== payload.id);
      });
    }
  });

  const fetchPrayers = async ({
    page = currentPage,
    searchTerm = debouncedSearch,
    status = statusFilter,
    campaign = campaignFilter,
  } = {}) => {
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        search: searchTerm,
        status,
        campaignId: campaign,
      });

      const res = await safeFetch(`/api/admin/prayers?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setPrayers(json.data.prayers || []);
        setTotal(json.data.total || 0);
        setTotalPages(json.data.totalPages || 1);
        setCurrentPage(json.data.currentPage || 1);
      }
    } catch {
      toast.error("Gagal memperbarui daftar doa donatur.");
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    selection.clearSelection();
    setCurrentPage(1);
    startTransition(() => {
      fetchPrayers({ page: 1, searchTerm: debouncedSearch });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleRefresh = () => {
    startTransition(() => {
      fetchPrayers({ searchTerm: debouncedSearch });
      toast.success("Daftar doa berhasil dimuat ulang.");
    });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleStatusFilterChange = (val) => {
    selection.clearSelection();
    setStatusFilter(val);
    setCurrentPage(1);
    startTransition(() => {
      fetchPrayers({ page: 1, status: val });
    });
  };

  const handleCampaignFilterChange = (val) => {
    selection.clearSelection();
    setCampaignFilter(val);
    setCurrentPage(1);
    startTransition(() => {
      fetchPrayers({ page: 1, campaign: val });
    });
  };

  const handlePageChange = (page) => {
    selection.clearSelection();
    setCurrentPage(page);
    startTransition(() => {
      fetchPrayers({ page });
    });
  };

  const handleToggleHide = async (prayer) => {
    setTogglingId(prayer.id);
    const nextHidden = !prayer.isPrayerHidden;
    try {
      const res = await safeFetch("/api/admin/prayers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: nextHidden ? "HIDE" : "SHOW",
          donationId: prayer.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPrayers((prev) =>
          prev.map((p) =>
            p.id === prayer.id ? { ...p, isPrayerHidden: nextHidden } : p
          )
        );
        toast.success(
          nextHidden
            ? "Doa donatur disembunyikan dari feed publik."
            : "Doa donatur kembali ditampilkan ke publik."
        );
      } else {
        toast.error(data.message || "Gagal mengubah visibilitas doa.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memproses moderasi.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleBulkToggleHide = async (isHidden) => {
    if (selection.selectedCount === 0) return;
    setIsBulkProcessing(true);
    try {
      const res = await safeFetch("/api/admin/prayers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: isHidden ? "BULK_HIDE" : "BULK_SHOW",
          donationIds: selection.selectedIds,
        }),
      });
      const data = await res.json();
      if (data.success) {
        const selectedSet = selection.selectedKeys;
        setPrayers((prev) =>
          prev.map((p) =>
            selectedSet.has(p.id) ? { ...p, isPrayerHidden: isHidden } : p
          )
        );
        toast.success(
          data.message ||
            `${selection.selectedCount} doa berhasil ${
              isHidden ? "disembunyikan" : "ditampilkan"
            }.`
        );
        selection.clearSelection();
      } else {
        toast.error(data.message || "Gagal memproses moderasi massal doa.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memproses moderasi.");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  return {
    prayers,
    total,
    totalPages,
    currentPage,
    search,
    statusFilter,
    campaignFilter,
    togglingId,
    isBulkProcessing,
    isPending,
    selection,
    handleRefresh,
    handleSearchChange,
    handleClearSearch,
    handleStatusFilterChange,
    handleCampaignFilterChange,
    handlePageChange,
    handleToggleHide,
    handleBulkToggleHide,
  };
}
