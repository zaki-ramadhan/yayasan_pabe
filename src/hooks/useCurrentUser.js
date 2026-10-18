"use client";

import { useSyncExternalStore } from "react";
import { AUTH_STORAGE_KEY, loginUser } from "@/services/authService";

function subscribeAuth(callback) {
  window.addEventListener("pabe_auth_change", callback);
  window.addEventListener("ygsm_auth_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("pabe_auth_change", callback);
    window.removeEventListener("ygsm_auth_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getAuthSnapshot() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_STORAGE_KEY) || localStorage.getItem("ygsm_auth_user");
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

  let currentUser = null;
  if (userJson) {
    try {
      currentUser = JSON.parse(userJson);
    } catch {
      currentUser = null;
    }
  }

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
