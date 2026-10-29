/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { UserAvatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusBadge } from "@/components/ui/Badge";
import { safeFetch } from "@/lib/safeFetch";
import { formatRupiah, formatDate, formatPaymentChannel } from "@/lib/formatters";
import { maskEmail, maskPhone } from "@/lib/security";
import { toast } from "@/hooks/useToast";

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

  // Infinite scroll observer on bottom sentinel
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
        {/* Header */}
        <DialogHeader className="px-5 py-3.5 sm:px-6 border-b border-slate-100 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
            Rincian donatur
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 sm:px-6 space-y-4">
          {/* Identitas & Ringkasan Terpadu (Non-Bento Card) */}
          <div className="bg-slate-50/70 border border-slate-200/90 rounded-lg p-3.5 sm:p-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200/70">
              <UserAvatar
                src={donor.avatar}
                name={donor.name}
                fallback="D"
                isAnonymous={donor.name === "Hamba Allah"}
                className="w-11 h-11 bg-white"
                fallbackClassName="text-sm"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm sm:text-base font-medium text-slate-900 leading-tight truncate">
                  {donor.name}
                </h4>
                <p className="text-xs text-slate-500 font-normal mt-0.5">
                  Donasi pertama: {donor.firstDonatedAt ? formatDate(donor.firstDonatedAt) : "-"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-xs">
              <div>
                <span className="text-slate-500 font-normal block">Email</span>
                <span className="text-slate-800 font-medium truncate block mt-0.5" title={donor.email || "-"}>
                  {donor.email ? maskEmail(donor.email) : "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-normal block">No. Telepon</span>
                <span className="text-slate-800 font-medium tabular-nums truncate block mt-0.5">
                  {donor.phone ? maskPhone(donor.phone) : "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-normal block">Total Donasi</span>
                <span className="text-slate-900 font-medium tabular-nums block mt-0.5">
                  {formatRupiah(donor.totalPaidAmount)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-normal block">Frekuensi</span>
                <span className="text-slate-900 font-medium block mt-0.5">
                  {donor.paidCount}x
                </span>
              </div>
            </div>
          </div>

          {/* Riwayat Donasi Terkini dengan Infinite Scroll */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-medium text-slate-700 uppercase tracking-wider">
                Riwayat donasi
              </h5>
              {donations.length > 0 && (
                <span className="text-xs text-slate-500">
                  {donations.length} donasi dimuat
                </span>
              )}
            </div>

            {isLoading ? (
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden animate-pulse">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-3 flex items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <Skeleton className="h-3.5 w-28 rounded" />
                      <Skeleton className="h-3 w-48 rounded" />
                      <Skeleton className="h-2.5 w-24 rounded" />
                    </div>
                    <div className="space-y-1 text-right shrink-0">
                      <Skeleton className="h-4 w-20 rounded ml-auto" />
                      <Skeleton className="h-3 w-16 rounded ml-auto" />
                    </div>
                  </div>
                ))}
              </div>
            ) : donations.length > 0 ? (
              <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 bg-white overflow-hidden">
                {donations.map((d) => (
                  <div key={d.id} className="p-3 flex items-center justify-between gap-3 text-sm hover:bg-slate-50/50 transition-colors">
                    <div className="min-w-0 space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 text-xs block truncate select-all">
                          {d.invoiceId}
                        </span>
                        {d.status && <StatusBadge status={d.status} className="scale-90 origin-left" />}
                      </div>
                      <p className="text-xs text-slate-600 truncate" title={d.campaignTitle}>
                        {d.campaignTitle}
                      </p>
                      <span className="text-xs text-slate-400 block font-normal">
                        {formatDate(d.paidAt || d.createdAt)}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-medium text-slate-900 text-sm block tabular-nums">
                        {formatRupiah(d.totalAmount)}
                      </span>
                      <span
                        className="inline-flex items-center justify-center px-1.5 py-0.5 mt-0.5 rounded text-2xs font-medium bg-slate-100 border border-slate-200 text-slate-600 max-w-[130px] truncate"
                        title={formatPaymentChannel(d.paymentChannel)}
                      >
                        {formatPaymentChannel(d.paymentChannel)}
                      </span>
                    </div>
                  </div>
                ))}

                {/* Infinite Scroll Sentinel / Loading More Indicator */}
                {hasMore && (
                  <div ref={sentinelRef} className="p-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    {isFetchingMore ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                        <span>Memuat donasi lebih lama...</span>
                      </>
                    ) : (
                      <span className="text-slate-400">Gulir ke bawah untuk memuat riwayat lainnya</span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
                Belum ada transaksi donasi yang tercatat untuk donatur ini.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 sm:px-6 sm:py-3.5 border-t border-slate-100 bg-white shrink-0 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 min-w-[84px] cursor-pointer"
          >
            Tutup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
