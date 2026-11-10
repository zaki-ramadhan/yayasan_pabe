"use client";

import { useState, useEffect, useCallback } from "react";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";

/**
 * Custom Hook untuk mengelola state data pelamar karier:
 * pagination, sorting, filter status, dan mutasi status berkas.
 */
export function useAdminApplicants({ isOpen, vacancyId }) {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchApplications = useCallback(
    async ({
      pageToLoad = 1,
      append = false,
      sortToUse = sortBy,
      statusToUse = statusFilter,
    } = {}) => {
      if (!vacancyId) return;
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      try {
        const queryParams = new URLSearchParams({
          vacancyId,
          page: String(pageToLoad),
          limit: "15",
          sort: sortToUse,
        });
        if (statusToUse && statusToUse !== "ALL") {
          queryParams.set("status", statusToUse);
        }

        const res = await safeFetch(
          `/api/admin/careers/applications?${queryParams.toString()}`
        );
        const data = await res.json();
        if (data.success) {
          const items = data.data || [];
          setApplications((prev) => (append ? [...prev, ...items] : items));
          setHasMore(Boolean(data.pagination?.hasMore));
          setTotalCount(data.pagination?.total ?? items.length);
          setPage(pageToLoad);
        }
      } catch {
        toast.error("Gagal memuat daftar pelamar.");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [vacancyId, sortBy, statusFilter]
  );

  useEffect(() => {
    let isCancelled = false;

    if (isOpen && vacancyId) {
      Promise.resolve().then(() => {
        if (!isCancelled) {
          fetchApplications({
            pageToLoad: 1,
            append: false,
            sortToUse: sortBy,
            statusToUse: statusFilter,
          });
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, vacancyId, sortBy, statusFilter, fetchApplications]);

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setPage(1);
    setApplications([]);
    fetchApplications({
      pageToLoad: 1,
      append: false,
      sortToUse: newSort,
      statusToUse: statusFilter,
    });
  };

  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
    setApplications([]);
    fetchApplications({
      pageToLoad: 1,
      append: false,
      sortToUse: sortBy,
      statusToUse: newStatus,
    });
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchApplications({
        pageToLoad: page + 1,
        append: true,
        sortToUse: sortBy,
        statusToUse: statusFilter,
      });
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId);
    try {
      const res = await safeFetch("/api/admin/careers/applications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: appId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Status pelamar berhasil diperbarui.");
        setApplications((prev) =>
          prev
            .map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
            .filter((app) => statusFilter === "ALL" || app.status === statusFilter)
        );
      } else {
        toast.error(data.message || "Gagal memperbarui status.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat memperbarui status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return {
    applications,
    isLoading,
    isLoadingMore,
    updatingId,
    hasMore,
    totalCount,
    sortBy,
    statusFilter,
    handleSortChange,
    handleStatusFilterChange,
    handleLoadMore,
    handleStatusChange,
  };
}

