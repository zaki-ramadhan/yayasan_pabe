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
