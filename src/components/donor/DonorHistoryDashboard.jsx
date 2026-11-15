/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useDebounce } from "@/hooks/useDebounce";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { DonorSummaryCards } from "@/components/donor/DonorSummaryCards";
import { DonorTransactionTable } from "@/components/donor/DonorTransactionTable";
import { DonorHistorySkeleton } from "@/components/donor/DonorHistorySkeleton";
import { DonorPendingInvoiceBanner } from "@/components/donor/DonorPendingInvoiceBanner";
import { DataFetchErrorState } from "@/components/shared/DataFetchErrorState";
import { TRANSACTION_TABS } from "@/lib/zisFilter";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

const TAB_TRIGGER_3D_CLASS =
  "text-sm font-medium transition-all cursor-pointer rounded-md px-3.5 sm:px-4 py-1.5 text-slate-600 hover:text-slate-900 data-[state=active]:text-white data-[state=active]:bg-gradient-to-b data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 data-[state=active]:border-t data-[state=active]:border-t-slate-500 data-[state=active]:border-x data-[state=active]:border-x-slate-700 data-[state=active]:border-b-2 data-[state=active]:border-b-slate-950 data-[state=active]:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_3px_6px_rgba(0,0,0,0.2)]";

export function DonorHistoryDashboard() {
  const router = useRouter();
  const { currentUser, isAuthenticated } = useCurrentUser();

  const [metrics, setMetrics] = useState({
    totalNominal: 0,
    totalTransactions: 0,
    totalPrograms: 0,
  });
  const [items, setItems] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10,
  });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState(TRANSACTION_TABS.ALL);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const debouncedSearch = useDebounce(search.trim(), 300);
  const isSearching = Boolean(search.trim().length > 0 && search.trim() !== debouncedSearch);

  // Check auth and redirect if guest
  useEffect(() => {
    // Only check after component mounts on client
    const timer = setTimeout(() => {
      if (!isAuthenticated && typeof window !== "undefined") {
        const stored = localStorage.getItem("pabe_auth_user");
        if (!stored) {
          router.replace("/login?redirect=/donatur/riwayat");
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  const fetchHistory = useCallback(
    async (pageToLoad = 1, currentLimit = pagination.limit, { silent = false } = {}) => {
      if (!currentUser?.email && !currentUser?.name) {
        setIsInitialLoading(false);
        setIsTableLoading(false);
        return;
      }

      if (!silent) {
        setIsTableLoading(true);
      }
      setFetchError(null);
      try {
        const params = new URLSearchParams({
          email: currentUser.email || "",
          name: currentUser.name || "",
          status: statusFilter,
          type: typeFilter,
          search: debouncedSearch,
          sortBy: "date",
          sortOrder: "desc",
          page: String(pageToLoad),
          limit: String(currentLimit),
        });

        const res = await safeFetch(`/api/user/donations?${params.toString()}`);
        const json = await res.json();

        if (json.success && json.data) {
          setMetrics(json.data.metrics);
          setItems(json.data.items);
          setPagination(json.data.pagination);
          if (Array.isArray(json.data.pendingInvoices)) {
            setPendingInvoices(json.data.pendingInvoices);
          }
        } else {
          if (!silent) setFetchError(json.message || "Gagal memuat riwayat donasi.");
        }
      } catch (err) {
        console.error("Gagal memuat riwayat donasi:", err);
        if (!silent) setFetchError(err.message || "Koneksi terputus saat mengambil data donasi.");
      } finally {
        if (!silent) {
          setIsInitialLoading(false);
          setIsTableLoading(false);
        }
      }
    },
    [
      currentUser?.email,
      currentUser?.name,
      statusFilter,
      typeFilter,
      debouncedSearch,
      pagination.limit,
    ]
  );

  useEffect(() => {
    if (currentUser?.email || currentUser?.name) {
      fetchHistory(1, pagination.limit);
    }
  }, [currentUser?.email, currentUser?.name, fetchHistory, pagination.limit]);

  // Auto-sync real-time saat donatur kembali aktif membuka tab riwayat (zero-reload)
  useEffect(() => {
    const handleSync = () => {
      if (document.visibilityState === "visible" && (currentUser?.email || currentUser?.name)) {
        fetchHistory(pagination.currentPage, pagination.limit, { silent: true });
      }
    };
    window.addEventListener("visibilitychange", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [currentUser?.email, currentUser?.name, fetchHistory, pagination.currentPage, pagination.limit]);

  const handlePageChange = (newPage) => {
    fetchHistory(newPage, pagination.limit);
  };

  const handleSearchChange = (val) => {
    const str = typeof val === "string" ? val : val?.target?.value || "";
    setSearch(str);
  };

  const handleClearSearch = () => {
    setSearch("");
  };

  const handleRefresh = async () => {
    await fetchHistory(pagination.currentPage, pagination.limit);
    toast.success("Riwayat transaksi berhasil diperbarui.");
  };

  const handleInvoiceCancelled = (cancelledInvoiceId) => {
    setPendingInvoices((prev) =>
      prev.filter((inv) => inv.invoiceId !== cancelledInvoiceId)
    );
    fetchHistory(pagination.currentPage, pagination.limit);
  };

  if (isInitialLoading) {
    return <DonorHistorySkeleton typeFilter={typeFilter} />;
  }

  return (
    <div className="space-y-2.5">
      {/* Banner Pengingat Tagihan Aktif Menunggu Pembayaran */}
      {!fetchError && pendingInvoices?.length > 0 && (
        <DonorPendingInvoiceBanner
          invoices={pendingInvoices}
          onInvoiceCancelled={handleInvoiceCancelled}
        />
      )}

      {/* Segmented Tabs Pemisah Donasi Umum vs ZIS */}
      <Tabs value={typeFilter} onValueChange={setTypeFilter}>
        <TabsList className="bg-sidebar border border-slate-200/90 shadow-2xs p-1 h-auto gap-1">
          <TabsTrigger value={TRANSACTION_TABS.ALL} className={TAB_TRIGGER_3D_CLASS}>
            Semua Transaksi
          </TabsTrigger>
          <TabsTrigger value={TRANSACTION_TABS.CAMPAIGN} className={TAB_TRIGGER_3D_CLASS}>
            Donasi Program
          </TabsTrigger>
          <TabsTrigger value={TRANSACTION_TABS.ZIS} className={TAB_TRIGGER_3D_CLASS}>
            Zakat, Infaq &amp; Sedekah
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 3 Metric Cards Strip */}
      <DonorSummaryCards metrics={metrics} typeFilter={typeFilter} isLoading={false} />

      {/* Error state if fetch failed */}
      {fetchError && (
        <DataFetchErrorState
          compact
          title="Kendala Sinkronisasi Riwayat Transaksi"
          description={
            typeof fetchError === "string"
              ? fetchError
              : "Gagal memuat riwayat transaksi Anda. Silakan coba lagi."
          }
          onRetry={() => fetchHistory(pagination.currentPage, pagination.limit)}
        />
      )}

      {/* Transaction Table */}
      <DonorTransactionTable
        items={items}
        pagination={pagination}
        search={search}
        statusFilter={statusFilter}
        typeFilter={typeFilter}
        isLoading={isTableLoading}
        isSearching={isSearching}
        onSearchChange={handleSearchChange}
        onClearSearch={handleClearSearch}
        onStatusFilterChange={setStatusFilter}
        onPageChange={handlePageChange}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
