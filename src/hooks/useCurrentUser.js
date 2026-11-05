"use client";

import { useSyncExternalStore, useMemo } from "react";
import { AUTH_STORAGE_KEY, loginUser } from "@/services/authService";

function subscribeAuth(callback) {
  window.addEventListener("pabe_auth_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("pabe_auth_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getAuthSnapshot() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.expiresAt && Date.now() > parsed.expiresAt) {
      return null;
    }

    // Auto-heal session cookie if missing or corrupt
    if (typeof document !== "undefined") {
      const match = document.cookie.match(/pabe_session=([^;]+)/);
      const curCookie = match ? decodeURIComponent(match[1].trim()) : null;
      if (!curCookie || curCookie === "USR-DONOR") {
        const validId = parsed?.id || parsed?.email || "";
        if (validId) {
          const durationSec = 30 * 24 * 60 * 60;
          document.cookie = `pabe_session=${encodeURIComponent(validId)}; path=/; max-age=${durationSec}; SameSite=Lax`;
          document.cookie = `pabe_role=${encodeURIComponent(parsed?.role || "DONOR")}; path=/; max-age=${durationSec}; SameSite=Lax`;
        }
      }
    }

    return raw;
  } catch {
    return null;
  }
}

function getAuthServerSnapshot() {
  return null;
}

export function useCurrentUser() {
  const userJson = useSyncExternalStore(
    subscribeAuth,
    getAuthSnapshot,
    getAuthServerSnapshot
  );

  const currentUser = useMemo(() => {
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  }, [userJson]);

  const updateLocalUser = (updatedData) => {
    if (!currentUser) return;
    const merged = { ...currentUser, ...updatedData };
    loginUser(merged);
  };

  return {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    updateLocalUser,
  };
}
