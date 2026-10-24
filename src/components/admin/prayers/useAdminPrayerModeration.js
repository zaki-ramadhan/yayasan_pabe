"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { toast } from "@/hooks/use-toast";
import { safeFetch } from "@/lib/safeFetch";

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
  const [isPending, startTransition] = useTransition();

  const debouncedSearch = useDebounce(search.trim(), 350);
  const isInitialMount = useRef(true);

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
    setStatusFilter(val);
    setCurrentPage(1);
    startTransition(() => {
      fetchPrayers({ page: 1, status: val });
    });
  };

  const handleCampaignFilterChange = (val) => {
    setCampaignFilter(val);
    setCurrentPage(1);
    startTransition(() => {
      fetchPrayers({ page: 1, campaign: val });
    });
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    startTransition(() => {
      fetchPrayers({ page });
    });
  };

  const handleToggleHide = async (prayer) => {
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
    isPending,
    handleRefresh,
    handleSearchChange,
    handleClearSearch,
    handleStatusFilterChange,
    handleCampaignFilterChange,
    handlePageChange,
    handleToggleHide,
  };
}
