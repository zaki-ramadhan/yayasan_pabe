"use client";

import { useEffect, useState } from "react";
import { Heart, MessageSquareQuote, ExternalLink } from "lucide-react";
import Link from "next/link";
import {
  DonorCard,
  DonorListItem,
  DonorListSkeleton,
  DonorEmptyText,
} from "@/components/donor/DonorDashboardPrimitives";
import { formatDate } from "@/lib/formatters";
import { safeFetch } from "@/lib/safeFetch";

export function DonorPrayersCard({ currentUser }) {
  const [prayers, setPrayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadPrayers() {
      if (!currentUser?.email && !currentUser?.name) {
        setIsLoading(false);
        return;
      }

      try {
        const params = new URLSearchParams();
        if (currentUser.email) params.set("email", currentUser.email);
        if (currentUser.name) params.set("name", currentUser.name);
        params.set("limit", "5");

        const res = await safeFetch(`/api/donor/prayers?${params.toString()}`);
        const json = await res.json();

        if (isMounted && json.success && json.data) {
          setPrayers(json.data.prayers || []);
        }
      } catch (err) {
        console.warn("Gagal memuat doa donatur:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadPrayers();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.email, currentUser?.name]);

  return (
    <DonorCard title="Doa & Harapan Saya">
      <div className="space-y-2.5">
        {isLoading ? (
          <DonorListSkeleton count={3} height="h-16" />
        ) : prayers.length === 0 ? (
          <DonorEmptyText message="Belum ada doa yang Anda kirimkan saat berdonasi" />
        ) : (
          prayers.map((item) => (
            <DonorListItem key={item.id} className="flex-col items-start gap-1.5 p-3">
              <div className="w-full flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-slate-900 truncate">
                  {item.campaignTitle}
                </span>
                <span className="text-xs font-normal text-slate-400 shrink-0">
                  {formatDate(item.createdAt)}
                </span>
              </div>

              <div className="flex items-start gap-1.5 text-slate-700 w-full">
                <MessageSquareQuote className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm font-normal italic leading-relaxed text-slate-800">
                  &ldquo;{item.prayer}&rdquo;
                </p>
              </div>

              {/* Respons Aamiin dan Tautan */}
              <div className="w-full pt-1 border-t border-slate-100 flex items-center justify-between text-xs font-normal">
                <span className="inline-flex items-center gap-1 text-rose-600">
                  <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  <span>{item.aminCount || 0} orang mengaminkan</span>
                </span>

                {item.campaignSlug && (
                  <Link
                    href={`/campaign/${item.campaignSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <span>Lihat program</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {/* Balasan Resmi Yayasan jika ada */}
              {item.prayerReply && (
                <div className="w-full mt-1 p-2 rounded-md bg-blue-50/70 border border-blue-200 text-xs font-normal text-slate-800 space-y-0.5">
                  <span className="font-medium text-primary block">
                    Balasan Pengurus Yayasan:
                  </span>
                  <p className="text-slate-700 leading-normal">
                    {item.prayerReply}
                  </p>
                </div>
              )}
            </DonorListItem>
          ))
        )}
      </div>
    </DonorCard>
  );
}
