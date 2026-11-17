"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CloseIcon } from "@solar-icons/react/linear/close";
import { formatRupiah } from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * Live Donation Social Proof Popup Toast.
 * Menampilkan nama donatur riil dari formulir, nominal, dan program tujuan secara bergantian.
 * Murni mengandalkan data transaksi berhasil (PAID) dari database.
 */
export function LiveDonationPopup() {
  const pathname = usePathname();
  const [donations, setDonations] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const isHoveredRef = useRef(false);

  const isHiddenPage = Boolean(
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/donatur") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/auth") ||
    pathname === "/login" ||
    pathname?.startsWith("/invoice") ||
    pathname?.includes("/donasi") ||
    pathname?.includes("/donate")
  );

  const canShow = !isHiddenPage && !isDismissed && donations.length > 0;

  useEffect(() => {
    if (isHiddenPage) return;
    let isMounted = true;

    async function loadRecent() {
      try {
        const res = await fetch("/api/donations?limit=10", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) return;
        const json = await res.json();
        if (isMounted && json?.success && Array.isArray(json.data)) {
          setDonations((prev) => {
            if (json.data.length === 0) return [];
            const latestNew = json.data[0];
            const latestCurrent = prev[0];
            if (latestNew && latestCurrent && latestNew.id !== latestCurrent.id) {
              setCurrentIndex(0);
              setIsVisible(true);
            }
            return json.data;
          });
        }
      } catch {
        // Abaikan kendala jaringan
      }
    }

    loadRecent();
    // Background polling setiap 30 detik untuk mendeteksi transaksi masuk secara otomatis
    const pollInterval = setInterval(loadRecent, 30000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [isHiddenPage]);

  useEffect(() => {
    if (!canShow) return;

    const initialTimer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(initialTimer);
  }, [canShow]);

  useEffect(() => {
    if (!canShow) return;

    let hideTimer = null;
    let nextTimer = null;

    if (isVisible) {
      hideTimer = setTimeout(() => {
        if (!isHoveredRef.current) {
          setIsVisible(false);
        }
      }, 6500);
    } else {
      nextTimer = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % donations.length);
        setTimeout(() => {
          setIsVisible(true);
        }, 80);
      }, 15000);
    }

    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      if (nextTimer) clearTimeout(nextTimer);
    };
  }, [isVisible, donations.length, canShow]);

  if (!canShow) {
    return null;
  }

  const currentDonation = donations[currentIndex];
  if (!currentDonation) return null;

  const donorName = currentDonation.donor || currentDonation.donorName || "Hamba Allah";
  const formattedAmount = formatRupiah(currentDonation.amount);
  const campaignTitle = currentDonation.campaignTitle || "Sedekah Umum Yayasan PABE";

  const isCampaignDetailPage = pathname?.startsWith("/program/");
  const bottomPositionClass = isCampaignDetailPage
    ? "bottom-20 sm:bottom-6"
    : "bottom-4 sm:bottom-6";

  return (
    <aside
      aria-label="Pemberitahuan Donasi Terkini"
      aria-hidden={!isVisible}
      onMouseEnter={() => {
        isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        isHoveredRef.current = false;
      }}
      className={cn(
        "fixed left-4 sm:left-6 z-30 max-w-[320px] sm:max-w-[350px] w-full select-none print:hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
        bottomPositionClass,
        isVisible
          ? "translate-y-0 opacity-100 scale-100 pointer-events-auto"
          : "translate-y-12 sm:translate-y-14 opacity-0 scale-95 pointer-events-none"
      )}
    >
      <div className="relative bg-white border border-slate-300 rounded-xl p-3.5 shadow-md shadow-slate-900/10 transition-shadow hover:shadow-lg flex items-start gap-3.5 overflow-hidden">
        {/* Pembungkus parent luar ikon */}
        <div className="w-9.5 h-9.5 rounded-full bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0 mt-0.5">
          {/* Lingkaran dalam solid warna sukses */}
          <div className="w-6.5 h-6.5 rounded-full bg-emerald-600 flex items-center justify-center">
            {/* Ceklis stroke putih tebal */}
            <svg
              className="w-3.5 h-3.5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Konten teks (maksimal font-semibold) */}
        <div className="flex-1 min-w-0 pr-6">
          <p className="text-sm font-semibold text-slate-900 truncate leading-tight">
            {donorName}
          </p>

          <p className="text-xs text-slate-700 mt-1 leading-normal">
            Berdonasi{" "}
            <span className="font-semibold text-emerald-800">{formattedAmount}</span>
          </p>

          <p className="text-xs text-slate-600 truncate mt-0.5">
            untuk {campaignTitle}
          </p>
        </div>

        {/* Tombol Tutup */}
        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => {
              setIsDismissed(true);
            }, 500);
          }}
          className="absolute right-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Tutup notifikasi donasi"
        >
          <CloseIcon className="w-4 h-4" strokeWidth={3} />
        </button>
      </div>
    </aside>
  );
}

