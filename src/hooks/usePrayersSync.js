"use client";

import { useState, useMemo, useCallback, useSyncExternalStore, useEffect } from "react";
import { safeFetch } from "@/lib/safeFetch";

const AMINED_STORAGE_KEY = "pabe_amined_prayers";
const SYNC_EVENT = "pabe_prayer_amin_sync";

function subscribe(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener(SYNC_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SYNC_EVENT, callback);
  };
}

function getAminedSnapshot() {
  if (typeof window === "undefined") return "[]";
  return localStorage.getItem(AMINED_STORAGE_KEY) || "[]";
}

function getServerSnapshot() {
  return "[]";
}

export function usePrayersSync(initialDonors = [], campaignSlug = null) {
  const [submittedPrayers, setSubmittedPrayers] = useState([]);
  const [serverLiveDonors, setServerLiveDonors] = useState([]);
  const [localExtraCounts, setLocalExtraCounts] = useState({});
  const aminedRaw = useSyncExternalStore(subscribe, getAminedSnapshot, getServerSnapshot);

  // Background polling untuk doa baru (setiap 20 detik saat tab aktif)
  useEffect(() => {
    if (!campaignSlug) return;

    let isMounted = true;
    const fetchLatestPrayers = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;

      try {
        const res = await safeFetch(
          `/api/donations?campaignSlug=${encodeURIComponent(campaignSlug)}&limit=10&skip=0`,
          { cache: "no-store" },
          6000
        );

        if (res.ok && isMounted) {
          const json = await res.json().catch(() => null);
          const list = json?.data?.donations || json?.data || [];
          if (Array.isArray(list) && list.length > 0) {
            setServerLiveDonors((prev) => {
              const existingIds = new Set([
                ...initialDonors.map((d) => d.id),
                ...submittedPrayers.map((d) => d.id),
                ...prev.map((d) => d.id),
              ]);
              const newItems = list.filter((item) => !existingIds.has(item.id));
              if (newItems.length === 0) return prev;
              return [...newItems, ...prev];
            });
          }
        }
      } catch {}
    };

    const interval = setInterval(fetchLatestPrayers, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [campaignSlug, initialDonors, submittedPrayers]);

  // Bersihkan cache lama di localStorage agar tidak menduplikasi hitungan database
  useEffect(() => {
    try {
      localStorage.removeItem("pabe_prayer_amin_counts");
    } catch {}
  }, []);

  let aminedSet = useMemo(() => {
    try {
      const parsed = JSON.parse(aminedRaw || "[]");
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }, [aminedRaw]);

  const allDonors = useMemo(() => {
    return [...submittedPrayers, ...serverLiveDonors, ...initialDonors];
  }, [submittedPrayers, serverLiveDonors, initialDonors]);

  const donors = useMemo(() => {
    return allDonors.map((d) => {
      const baseCount = typeof d.aminCount === "number" ? d.aminCount : 0;
      const extra = localExtraCounts[d.id] || 0;
      return {
        ...d,
        aminCount: baseCount + extra,
      };
    });
  }, [allDonors, localExtraCounts]);

  const handleToggleAmin = useCallback((donorId) => {
    if (!donorId) return;
    try {
      const storedAmined = JSON.parse(localStorage.getItem(AMINED_STORAGE_KEY) || "[]");
      if (Array.isArray(storedAmined) && storedAmined.includes(donorId)) return;

      const updatedAmined = Array.isArray(storedAmined) ? [...storedAmined, donorId] : [donorId];
      localStorage.setItem(AMINED_STORAGE_KEY, JSON.stringify(updatedAmined));

      // Optimistic bump di memori sesi saat ini
      setLocalExtraCounts((prev) => ({
        ...prev,
        [donorId]: 1,
      }));

      window.dispatchEvent(
        new CustomEvent(SYNC_EVENT, {
          detail: { donorId },
        })
      );

      // Sinkronisasi permanen ke backend & database PostgreSQL
      safeFetch("/api/donations/amin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId: donorId, action: "increment" }),
        timeoutMs: 8000,
      }).catch(() => {});
    } catch {
      // Ignore storage errors
    }
  }, []);

  const addNewPrayer = useCallback((newDonor) => {
    setSubmittedPrayers((prev) => [newDonor, ...prev]);
  }, []);

  return {
    donors,
    aminedSet,
    handleToggleAmin,
    addNewPrayer,
  };
}

