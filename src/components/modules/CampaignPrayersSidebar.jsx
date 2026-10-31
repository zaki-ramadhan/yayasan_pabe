/* eslint-disable react-hooks/set-state-in-effect */
"use client";
// POV-aware: messages from the current logged-in user render as outgoing bubbles

import { useMemo, useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, MessageCircle } from "lucide-react";
import { PrayerChatBubble } from "@/components/modules/PrayerChatBubble";
import { PrayerInputBar } from "@/components/modules/PrayerInputBar";
import { usePrayersSync } from "@/hooks/usePrayersSync";
import { getStoredUser } from "@/services/authService";
import { DateStickyBadge } from "@/components/shared/DateStickyBadge";
import { getDateKey, getDateBadgeLabel } from "@/lib/dateUtils";
import { validatePrayer } from "@/lib/security";
import { toast } from "@/hooks/useToast";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;



export function CampaignPrayersSidebar({ initialDonors = [], campaignSlug, isClosed = false }) {
  const { donors, aminedSet, handleToggleAmin } = usePrayersSync(initialDonors);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollRef = useRef(null);
  const prevScrollHeightRef = useRef(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [userInvoices, setUserInvoices] = useState([]);
  const initialScrollDone = useRef(false);
  const router = useRouter();

  useEffect(() => {
    setCurrentUser(getStoredUser());
    try {
      const raw = localStorage.getItem("pabe_donor_invoices");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setUserInvoices(parsed);
        }
      }
    } catch {}

    const handleAuthChange = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener("pabe_auth_change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("pabe_auth_change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const checkIsOwn = useCallback(
    (donor) => {
      if (!donor) return false;

      // 1. Cek dari tagihan lokal browser berdasarkan invoiceId
      if (donor.invoiceId && userInvoices.some((inv) => inv.invoiceId === donor.invoiceId)) {
        return true;
      }

      // 2. Cek user yang sedang login
      if (currentUser) {
        if (donor.userId && donor.userId === currentUser.id) return true;
        if (donor.id && donor.id === currentUser.id) return true;

        if (
          currentUser.email &&
          donor.donorEmail &&
          currentUser.email.trim().toLowerCase() === donor.donorEmail.trim().toLowerCase()
        ) {
          return true;
        }

        if (
          !donor.isAnonymous &&
          currentUser.name &&
          donor.name &&
          currentUser.name.trim().toLowerCase() === donor.name.trim().toLowerCase()
        ) {
          return true;
        }
      }

      // 3. Cek nama dari riwayat tagihan lokal browser bila bukan anonim
      if (!donor.isAnonymous && donor.name && userInvoices.length > 0) {
        if (
          userInvoices.some(
            (inv) =>
              !inv.isAnonymous &&
              inv.donorName &&
              inv.donorName.trim().toLowerCase() === donor.name.trim().toLowerCase()
          )
        ) {
          return true;
        }
      }

      return false;
    },
    [currentUser, userInvoices]
  );

  // Urutan kronologis percakapan (terbaru di indeks 0)
  const allPrayers = useMemo(() => {
    const list = donors.filter((d) => Boolean(d.prayer && d.prayer.trim()));
    return [...list].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  }, [donors]);

  const hasMore = visibleCount < allPrayers.length;

  // For chat display: take most-recent visibleCount items, then reverse so oldest is on top
  const displayPrayers = useMemo(() => {
    return allPrayers.slice(0, visibleCount).reverse();
  }, [allPrayers, visibleCount]);

  // Sisipkan pemisah tanggal ala WhatsApp saat terjadi pergantian hari
  const prayersWithSeparators = useMemo(() => {
    const items = [];
    let lastDateKey = null;

    for (const donor of displayPrayers) {
      const dateKey = getDateKey(donor.date);
      if (dateKey !== lastDateKey) {
        items.push({
          type: "date_badge",
          id: `date-badge-${dateKey}-${donor.id}`,
          label: getDateBadgeLabel(donor.date),
        });
        lastDateKey = dateKey;
      }
      items.push({
        type: "prayer",
        id: donor.id,
        donor,
      });
    }

    return items;
  }, [displayPrayers]);

  // Scroll to bottom on initial render (and after initial load)
  useLayoutEffect(() => {
    if (initialScrollDone.current) return;
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
    initialScrollDone.current = true;
  }, [prayersWithSeparators]);

  // After loading more, preserve scroll position to prevent jump
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !prevScrollHeightRef.current) return;
    const diff = el.scrollHeight - prevScrollHeightRef.current;
    el.scrollTop = diff;
    prevScrollHeightRef.current = 0;
  }, [visibleCount]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    prevScrollHeightRef.current = scrollRef.current?.scrollHeight ?? 0;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, allPrayers.length));
      setIsLoadingMore(false);
    }, 600);
  }, [isLoadingMore, hasMore, allPrayers.length]);

  // Attach scroll listener
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop < 40) loadMore();
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [loadMore]);

  const handleSend = (text) => {
    if (isClosed) return;
    const trimmed = (text || "").trim();
    const prayerValidation = validatePrayer(trimmed);
    if (!prayerValidation.isValid) {
      toast.error(prayerValidation.message);
      return;
    }
    const user = getStoredUser();
    const donateUrl = `/campaign/${campaignSlug}/donate?prayer=${encodeURIComponent(trimmed)}`;

    if (!user) {
      toast.info("Masuk akun dan selesaikan donasi untuk menitipkan doa.");
      router.push(`/login?redirect=${encodeURIComponent(donateUrl)}&reason=donation_requires_login`);
    } else {
      toast.info("Lanjutkan donasi terlebih dahulu untuk menitipkan doa.");
      router.push(donateUrl);
    }
  };

  if (allPrayers.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-semibold text-slate-950 text-base">
            Doa-Doa Orang Baik
          </h3>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-2xs overflow-hidden flex flex-col h-[280px]">
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-2 bg-slate-50/50">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1 border border-emerald-100">
              <MessageCircle className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Belum ada doa kebaikan</p>
            <p className="text-xs text-slate-500 max-w-[240px] leading-relaxed">
              Jadilah orang baik pertama yang menitipkan doa dan harapan untuk program ini.
            </p>
          </div>
          {!isClosed && <PrayerInputBar onSend={handleSend} isClosed={isClosed} />}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-slate-950 text-base">
          Doa-Doa Orang Baik
        </h3>
      </div>



      {/* Chat Room Container ala Telegram / WhatsApp */}
      <div className="relative rounded-2xl border border-slate-300 overflow-hidden shadow-xs bg-slate-900 flex flex-col">
        {/* Authentic Wallpaper Background (Original image without direct filter) */}
        <div
          className="absolute inset-0 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage: "url('/img/textures/wallpaper-chat.webp')",
          }}
        />
        {/* Dark overlay layer to dim wallpaper smoothly */}
        <div className="absolute inset-0 pointer-events-none bg-slate-950/40" />

        {/* Scrollable chat container — increased height for more forum room */}
        <div
          ref={scrollRef}
          className="relative z-10 min-h-[440px] max-h-[580px] sm:max-h-[620px] overflow-y-auto px-3.5 py-4 space-y-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#94a3b8 transparent" }}
        >
          {/* Loader di dalam scroll container, paling atas — persis seperti WhatsApp */}
          {isLoadingMore && (
            <div className="flex justify-center py-3">
              <Loader2 className="w-[18px] h-[18px] text-primary animate-spin" />
            </div>
          )}

          <div className="space-y-4">
            {prayersWithSeparators.map((item) =>
              item.type === "date_badge" ? (
                <DateStickyBadge key={item.id} label={item.label} className="py-0.5" />
              ) : (
                <PrayerChatBubble
                  key={item.id}
                  donor={item.donor}
                  isAmined={aminedSet.has(item.donor.id)}
                  onToggleAmin={handleToggleAmin}
                  isOwn={checkIsOwn(item.donor)}
                  currentUserAvatar={currentUser?.avatar}
                />
              )
            )}
          </div>
        </div>

        {/* Footer input / Closed state lock banner */}
        {isClosed ? (
          <div className="relative z-10 p-2 sm:px-2.5 sm:pb-2.5 sm:pt-1">
            <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md rounded-full text-slate-300 text-xs sm:text-sm shadow-sm select-none text-center">
              <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Program telah selesai · Pengiriman doa telah ditutup</span>
            </div>
          </div>
        ) : (
          <div
            id="tour-prayer-input"
            className="relative z-10 p-2 sm:px-2.5 sm:pb-2.5 sm:pt-1 bg-transparent"
          >
            <PrayerInputBar onSend={handleSend} />
          </div>
        )}
      </div>
    </div>
  );
}
