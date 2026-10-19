"use client";

import { useState, useEffect, useRef, useSyncExternalStore } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

function subscribeNetwork(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getNetworkSnapshot() {
  return navigator.onLine;
}

function getServerNetworkSnapshot() {
  return true;
}

export function OfflineStatusBanner() {
  const isOnline = useSyncExternalStore(subscribeNetwork, getNetworkSnapshot, getServerNetworkSnapshot);
  const [justReconnected, setJustReconnected] = useState(false);
  const prevOnlineRef = useRef(true);

  useEffect(() => {
    if (!prevOnlineRef.current && isOnline) {
      setJustReconnected(true);
      const timer = setTimeout(() => {
        setJustReconnected(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
    prevOnlineRef.current = isOnline;
  }, [isOnline]);

  const isOffline = !isOnline;

  if (!isOffline && !justReconnected) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-0 inset-x-0 z-50 px-4 py-2 text-xs sm:text-sm font-medium transition-all duration-300 shadow-md flex items-center justify-between gap-3 backdrop-blur-md",
        isOffline
          ? "bg-slate-900/95 text-amber-300 border-b border-amber-500/30"
          : "bg-emerald-900/95 text-emerald-200 border-b border-emerald-500/30"
      )}
    >
      <div className="flex items-center gap-2.5 max-w-7xl mx-auto w-full justify-between">
        <div className="flex items-center gap-2 min-w-0">
          {isOffline ? (
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          ) : (
            <Wifi className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
          )}
          <span className="truncate">
            {isOffline
              ? "Koneksi internet Anda terputus. Menampilkan data tersimpan sementara."
              : "Koneksi internet telah pulih kembali."}
          </span>
        </div>

        {isOffline && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="hidden sm:inline">Coba Lagi</span>
          </button>
        )}
      </div>
    </div>
  );
}
