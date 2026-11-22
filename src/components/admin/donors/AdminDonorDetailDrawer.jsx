/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { AdminDonorProfileHeader } from "./AdminDonorProfileHeader";
import { AdminDonorDonationHistory } from "./AdminDonorDonationHistory";

export function AdminDonorDetailDrawer({
  isOpen,
  onOpenChange,
  donor = null,
}) {
  const [donations, setDonations] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const sentinelRef = useRef(null);
  const isFetchingMoreRef = useRef(false);
  const hasMoreRef = useRef(false);
  const pageRef = useRef(1);

  useEffect(() => {
    isFetchingMoreRef.current = isFetchingMore;
    hasMoreRef.current = hasMore;
    pageRef.current = page;
  }, [isFetchingMore, hasMore, page]);

  const fetchInitialHistory = useCallback(async () => {
    if (!donor) return;
    setIsLoading(true);
    setDonations([]);
    setPage(1);
    setHasMore(false);

    try {
      const params = new URLSearchParams();
      if (donor.email) params.set("email", donor.email);
      if (donor.phone) params.set("phone", donor.phone);
      if (donor.name) params.set("name", donor.rawName || donor.name);
      params.set("page", "1");
      params.set("limit", "8");

      const res = await safeFetch(`/api/admin/donors/history?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        setDonations(data.data.donations || []);
        const more = Boolean(data.data.pagination?.hasMore);
        setHasMore(more);
        hasMoreRef.current = more;
      }
    } catch {
      toast.error("Gagal memuat riwayat donasi.");
    } finally {
      setIsLoading(false);
    }
  }, [donor]);

  const loadMore = useCallback(async () => {
    if (!donor || isLoading || isFetchingMoreRef.current || !hasMoreRef.current) return;
    setIsFetchingMore(true);

    try {
      const nextPage = pageRef.current + 1;
      const params = new URLSearchParams();
      if (donor.email) params.set("email", donor.email);
      if (donor.phone) params.set("phone", donor.phone);
      if (donor.name) params.set("name", donor.rawName || donor.name);
      params.set("page", String(nextPage));
      params.set("limit", "8");

      const res = await safeFetch(`/api/admin/donors/history?${params.toString()}`);
      const data = await res.json();
      if (data.success && data.data) {
        const nextItems = data.data.donations || [];
        setDonations((prev) => [...prev, ...nextItems]);
        setPage(nextPage);
        const more = Boolean(data.data.pagination?.hasMore);
        setHasMore(more);
        hasMoreRef.current = more;
      } else {
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch {
      toast.error("Gagal memuat lebih banyak riwayat.");
    } finally {
      setIsFetchingMore(false);
    }
  }, [donor, isLoading]);

  useEffect(() => {
    let ignore = false;
    if (isOpen && donor) {
      const load = async () => {
        if (!ignore) await fetchInitialHistory();
      };
      load();
    } else {
      setDonations([]);
      setPage(1);
      setHasMore(false);
    }
    return () => {
      ignore = true;
    };
  }, [isOpen, donor, fetchInitialHistory]);

  useEffect(() => {
    if (!isOpen || isLoading || !hasMore) return;
    const sentinelEl = sentinelRef.current;
    if (!sentinelEl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingMoreRef.current && hasMoreRef.current) {
          loadMore();
        }
      },
      { rootMargin: "150px" }
    );

    observer.observe(sentinelEl);
    return () => observer.disconnect();
  }, [isOpen, isLoading, hasMore, loadMore]);

  if (!donor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl max-h-[85vh] p-0 overflow-hidden flex flex-col bg-white border border-slate-200">
        <DialogHeader className="px-5 py-3.5 sm:px-6 border-b border-slate-100 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Rincian donatur
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-5 sm:px-6 space-y-7">
          <AdminDonorProfileHeader donor={donor} />

          <AdminDonorDonationHistory
            donations={donations}
            isLoading={isLoading}
            hasMore={hasMore}
            isFetchingMore={isFetchingMore}
            sentinelRef={sentinelRef}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
