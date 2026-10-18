"use client";

import { useState, useMemo, useCallback, useSyncExternalStore } from "react";

const AMINED_STORAGE_KEY = "pabe_amined_prayers";
const AMIN_COUNTS_KEY = "pabe_prayer_amin_counts";
const SYNC_EVENT = "pabe_prayer_amin_sync";

function subscribe(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener(SYNC_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(SYNC_EVENT, callback);
  };
}

function getAminedSnapshot() {
  return localStorage.getItem(AMINED_STORAGE_KEY) || localStorage.getItem("ygsm_amined_prayers") || "[]";
}

function getCountsSnapshot() {
  return localStorage.getItem(AMIN_COUNTS_KEY) || localStorage.getItem("ygsm_prayer_amin_counts") || "{}";
}

function getServerSnapshot() {
  return "[]";
}

function getServerCountsSnapshot() {
  return "{}";
}

export function usePrayersSync(initialDonors = []) {
  const [submittedPrayers, setSubmittedPrayers] = useState([]);
  const aminedRaw = useSyncExternalStore(subscribe, getAminedSnapshot, getServerSnapshot);
  const countsRaw = useSyncExternalStore(subscribe, getCountsSnapshot, getServerCountsSnapshot);

  let aminedSet = new Set();
  let extraCounts = {};

  try {
    const parsedAmined = JSON.parse(aminedRaw || "[]");
    if (Array.isArray(parsedAmined)) {
      aminedSet = new Set(parsedAmined);
    }
  } catch {
    aminedSet = new Set();
  }

  try {
    const parsedCounts = JSON.parse(countsRaw || "{}");
    if (parsedCounts && typeof parsedCounts === "object") {
      extraCounts = parsedCounts;
    }
  } catch {
    extraCounts = {};
  }

  const allDonors = useMemo(() => {
    return [...submittedPrayers, ...initialDonors];
  }, [submittedPrayers, initialDonors]);

  const donors = allDonors.map((d) => {
    const baseCount =
      typeof d.aminCount === "number" && d.aminCount > 0
        ? d.aminCount
        : ((d.id ? d.id.charCodeAt(d.id.length - 1) : 0) % 7) + 3;
    const extra = extraCounts[d.id] || 0;
    return {
      ...d,
      aminCount: baseCount + extra,
    };
  });

  const handleToggleAmin = useCallback((donorId) => {
    try {
      const storedAmined = JSON.parse(localStorage.getItem(AMINED_STORAGE_KEY) || "[]");
      if (Array.isArray(storedAmined) && storedAmined.includes(donorId)) return;

      const updatedAmined = Array.isArray(storedAmined) ? [...storedAmined, donorId] : [donorId];
      const storedCounts = JSON.parse(localStorage.getItem(AMIN_COUNTS_KEY) || "{}");
      storedCounts[donorId] = (storedCounts[donorId] || 0) + 1;

      localStorage.setItem(AMINED_STORAGE_KEY, JSON.stringify(updatedAmined));
      localStorage.setItem(AMIN_COUNTS_KEY, JSON.stringify(storedCounts));

      window.dispatchEvent(
        new CustomEvent(SYNC_EVENT, {
          detail: { donorId },
        })
      );
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

