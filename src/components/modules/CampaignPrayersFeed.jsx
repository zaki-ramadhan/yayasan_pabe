"use client";

import { useState, useMemo, useCallback, useSyncExternalStore } from "react";
import { Loader2 } from "lucide-react";
import { PRAYER_SORT_OPTIONS } from "@/data/sortOptions";
import { SortDropdown } from "@/components/shared/SortDropdown";
import { PrayerCard } from "@/components/modules/PrayerCard";
import { PostDonationPrayerForm } from "@/components/donation/PostDonationPrayerForm";
import { getPendingDonationForCampaign, PRAYER_SUBMITTED_EVENT } from "@/lib/donorStorage";
import { usePrayersSync } from "@/hooks/usePrayersSync";
import { useScrollLoadMore } from "@/hooks/useScrollLoadMore";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 6;



function subscribePendingDonation(callback) {
  window.addEventListener(PRAYER_SUBMITTED_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(PRAYER_SUBMITTED_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getInvoicesSnapshot() {
  return localStorage.getItem("pabe_donor_invoices") || localStorage.getItem("ygsm_donor_invoices") || "[]";
}

function getServerInvoicesSnapshot() {
  return "[]";
}

export function CampaignPrayersFeed({ initialDonors = [], campaignSlug, campaignTitle }) {
  const { donors, aminedSet, handleToggleAmin, addNewPrayer } = usePrayersSync(initialDonors);
  const [sortBy, setSortBy] = useState("terbaru");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const invoicesRaw = useSyncExternalStore(
    subscribePendingDonation,
    getInvoicesSnapshot,
    getServerInvoicesSnapshot
  );

  const pendingDonation = useMemo(() => {
    if (!campaignSlug) return null;
    return getPendingDonationForCampaign(campaignSlug, invoicesRaw);
  }, [campaignSlug, invoicesRaw]);

  const sortedDonors = useMemo(() => {
    const list = [...donors];
    if (sortBy === "terpopuler") {
      return list.sort((a, b) => b.aminCount - a.aminCount);
    }
    return list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [donors, sortBy]);

  const prayersOnly = useMemo(() => {
    return sortedDonors.filter((d) => Boolean(d.prayer && d.prayer.trim()));
  }, [sortedDonors]);

  const visiblePrayers = prayersOnly.slice(0, visibleCount);
  const hasMore = visibleCount < prayersOnly.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, prayersOnly.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMore, prayersOnly.length]);

  const scrollRef = useScrollLoadMore({ onLoadMore: loadMore, threshold: 80 });

  if (prayersOnly.length === 0 && !pendingDonation) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm sm:text-base">
        Belum ada data
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header: Title & Sort Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-950 text-base sm:text-lg">
            Doa &amp; Dukungan Kebaikan
          </h3>
          <p className="text-sm sm:text-base text-slate-600 mt-0.5">
            Untaian doa tulus dari para donatur untuk mustahik dan sesama.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <SortDropdown
            options={PRAYER_SORT_OPTIONS}
            value={sortBy}
            onChange={(val) => {
              setSortBy(val);
              setVisibleCount(PAGE_SIZE);
            }}
            label="Urutkan"
            className="h-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Post-Donation Prayer Form */}
      {pendingDonation && (
        <div id="tour-prayer-input">
        <PostDonationPrayerForm
          invoiceId={pendingDonation.invoiceId}
          campaignSlug={campaignSlug}
          donorName={pendingDonation.donorName}
          defaultAnonymous={pendingDonation.isAnonymous}
          onSuccess={(data) => {
            if (addNewPrayer) {
              addNewPrayer({
                id: data.id || `prayer-${Date.now()}`,
                name: data.isAnonymous ? "Hamba Allah" : (data.donorName || pendingDonation.donorName || "Donatur"),
                amount: data.amount || 0,
                date: new Date().toISOString(),
                prayer: data.prayer,
                aminCount: 0,
                isAnonymous: Boolean(data.isAnonymous),
              });
            }
          }}
        />
        </div>
      )}

      {/* Scrollable prayer grid — scroll ke bawah untuk load lebih */}
      <div
        ref={scrollRef}
        className="max-h-[460px] sm:max-h-[500px] overflow-y-auto pr-2 pt-3 pb-3"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#cbd5e1 transparent" }}
      >
        {visiblePrayers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 sm:gap-y-7 gap-x-3.5 sm:gap-x-4">
            {visiblePrayers.map((donor) => (
              <PrayerCard
                key={donor.id}
                donor={donor}
                isAmined={aminedSet.has(donor.id)}
                onToggleAmin={handleToggleAmin}
                isCompact={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm sm:text-base">
            Belum ada data
          </div>
        )}

        {/* Loading indicator di dalam scroll area */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-[18px] h-[18px] text-primary animate-spin" />
          </div>
        )}

      </div>
    </div>
  );
}
