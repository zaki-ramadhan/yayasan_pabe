/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DonorSummaryCards } from "@/components/donor/DonorSummaryCards";
import { DonorTransactionTable } from "@/components/donor/DonorTransactionTable";
import { DonorHistorySkeleton } from "@/components/donor/DonorHistorySkeleton";
import { DataFetchErrorState } from "@/components/shared/DataFetchErrorState";
import { useDebounce } from "@/hooks/useDebounce";
import { sanitizeSearchQuery } from "@/lib/security";
import { safeFetch } from "@/lib/safeFetch";

export function DonorHistoryDashboard() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useCurrentUser();

  const [metrics, setMetrics] = useState({
    totalNominal: 0,
    totalTransactions: 0,
    totalPrograms: 0,
  });
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 25,
  });
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const debouncedSearch = useDebounce(search, 350);

  // Check auth and redirect if guest
  useEffect(() => {
    // Only check after component mounts on client
    const timer = setTimeout(() => {
      if (!isAuthenticated && typeof window !== "undefined") {
        const stored = localStorage.getItem("pabe_auth_user") || localStorage.getItem("ygsm_auth_user");
        if (!stored) {
          router.replace("/login?redirect=/donatur/riwayat");
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  const fetchHistory = useCallback(
    async (pageToLoad = 1, currentLimit = pagination.limit) => {
      if (!currentUser?.email && !currentUser?.name) {
        setIsInitialLoading(false);
        setIsTableLoading(false);
        return;
      }

      setIsTableLoading(true);
      setFetchError(null);
      try {
        const params = new URLSearchParams({
          email: currentUser.email || "",
          name: currentUser.name || "",
          search: debouncedSearch.trim(),
          sortBy,
          sortOrder,
          page: String(pageToLoad),
          limit: String(currentLimit),
        });

        const res = await safeFetch(`/api/user/donations?${params.toString()}`);
        const json = await res.json();

        if (json.success && json.data) {
          setMetrics(json.data.metrics);
          setItems(json.data.items);
          setPagination(json.data.pagination);
        } else {
          setFetchError(json.message || "Gagal memuat riwayat donasi.");
        }
      } catch (err) {
        console.error("Gagal memuat riwayat donasi:", err);
        setFetchError(err.message || "Koneksi terputus saat mengambil data donasi.");
      } finally {
        setIsInitialLoading(false);
        setIsTableLoading(false);
      }
    },
    [
      currentUser?.email,
      currentUser?.name,
      debouncedSearch,
      sortBy,
      sortOrder,
      pagination.limit,
    ]
  );

  useEffect(() => {
    if (currentUser?.email || currentUser?.name) {
      fetchHistory(1, pagination.limit);
    }
  }, [currentUser?.email, currentUser?.name, debouncedSearch, sortBy, sortOrder, fetchHistory, pagination.limit]);

  const handlePageChange = (newPage) => {
    fetchHistory(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit }));
    fetchHistory(1, newLimit);
  };

  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  if (isInitialLoading) {
    return <DonorHistorySkeleton />;
  }

  return (
    <div className="space-y-2.5">
      {/* 3 Metric Cards Strip */}
      <DonorSummaryCards metrics={metrics} isLoading={false} />

      {/* Error state if fetch failed */}
      {fetchError && (
        <DataFetchErrorState
          compact
          title="Gangguan Koneksi Riwayat Donasi"
          description="Gagal memuat riwayat transaksi donasi. Silakan periksa jaringan dan coba lagi."
          onRetry={() => fetchHistory(pagination.currentPage, pagination.limit)}
        />
      )}

      {/* Transaction Table */}
      <DonorTransactionTable
        items={items}
        pagination={pagination}
        search={search}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isTableLoading}
        onSearchChange={(val) => setSearch(sanitizeSearchQuery(val))}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}
