"use client";

import { useSyncExternalStore } from "react";
import { USER_ROLES } from "@/services/authService";

function getClientIsAdmin() {
  if (typeof document === "undefined") return false;
  try {
    const match = document.cookie.match(/(?:^|;\s*)pabe_role=([^;]+)/);
    const role = match ? decodeURIComponent(match[1].trim()) : null;
    return (
      role === USER_ROLES.ADMIN ||
      role === USER_ROLES.SUPER_ADMIN ||
      role === "ADMIN" ||
      role === "SUPER_ADMIN"
    );
  } catch {
    return false;
  }
}

function subscribe() {
  return () => {};
}

/**
 * Lightweight client hook using React's useSyncExternalStore to detect admin privileges.
 * Safe from hydration mismatches (server snapshot returns false).
 * Zero cascading renders, zero network overhead.
 *
 * @returns {boolean}
 */
export function useIsAdmin() {
  return useSyncExternalStore(subscribe, getClientIsAdmin, () => false);
}
