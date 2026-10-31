"use client";

import { useState, useCallback } from "react";
import { Loader2, FileText } from "lucide-react";
import { CampaignUpdateItem } from "@/components/campaign/CampaignUpdateItem";
import { useScrollLoadMore } from "@/hooks/useScrollLoadMore";
import { EmptyState } from "@/components/shared/EmptyState";

const PAGE_SIZE = 3;

export function CampaignUpdatesFeed({ updates = [] }) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const hasMore = visibleCount < updates.length;
  const visibleUpdates = updates.slice(0, visibleCount);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, updates.length));
      setIsLoadingMore(false);
    }, 450);
  }, [isLoadingMore, hasMore, updates.length]);

  const scrollRef = useScrollLoadMore({ onLoadMore: loadMore, threshold: 80 });

  if (!updates || updates.length === 0) {
    return (
      <EmptyState
        variant="dashed"
        icon={FileText}
        title="Belum ada kabar penyaluran"
        description="Laporan implementasi dan dokumentasi penyaluran donasi untuk program ini akan diperbarui oleh tim lapangan yayasan."
      />
    );
  }

  return (
    <div
      ref={scrollRef}
      className="max-h-[580px] sm:max-h-[620px] overflow-y-auto pr-2 focus:outline-none"
      style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
    >
      <div className="divide-y divide-slate-200">
        {visibleUpdates.map((upd) => (
          <CampaignUpdateItem key={upd.id} update={upd} />
        ))}
      </div>

      {/* Loading Indicator saat infinite scroll */}
      {isLoadingMore && (
        <div className="flex items-center justify-center gap-2 py-4 text-xs sm:text-sm text-slate-500">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <span>Memuat kabar penyaluran lainnya...</span>
        </div>
      )}

      {/* Keterangan saat semua kabar telah dimuat */}
      {!hasMore && updates.length > PAGE_SIZE && (
        <div className="text-center py-4 text-xs text-slate-600 select-none">
          Semua kabar penyaluran telah ditampilkan
        </div>
      )}
    </div>
  );
}
