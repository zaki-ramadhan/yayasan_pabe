"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import {
  DEMO_USERS,
  USER_ROLES,
} from "@/services/authService";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardMetricCards } from "@/components/dashboard/DashboardMetricCards";
import { DonorDashboardView } from "@/components/dashboard/DonorDashboardView";
import { VolunteerDashboardView } from "@/components/dashboard/VolunteerDashboardView";
import { AdminDashboardView } from "@/components/dashboard/AdminDashboardView";
import { safeFetch } from "@/lib/safeFetch";

function subscribeAuth(callback) {
  window.addEventListener("ygsm_auth_change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("ygsm_auth_change", callback);
    window.removeEventListener("storage", callback);
  };
}

function getAuthSnapshot() {
  return localStorage.getItem("ygsm_auth_user");
}

function getAuthServerSnapshot() {
  return null;
}

export default function AdminDashboardPage() {
  const userJson = useSyncExternalStore(subscribeAuth, getAuthSnapshot, getAuthServerSnapshot);
  const currentUser = userJson ? JSON.parse(userJson) : DEMO_USERS[0];
  const userRole = currentUser?.role || USER_ROLES.SUPER_ADMIN;

  const [stats, setStats] = useState(null);

  useEffect(() => {
    safeFetch("/api/dashboard/stats", { timeoutMs: 10000 })
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => console.warn("Failed to fetch dashboard stats:", err));
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DashboardHeader currentUser={currentUser} userRole={userRole} />
      <DashboardMetricCards userRole={userRole} stats={stats} />

      {/* Role-Specific Workflows & Panels */}
      {userRole === USER_ROLES.DONOR ? (
        <DonorDashboardView currentUser={currentUser} />
      ) : userRole === USER_ROLES.VOLUNTEER ? (

        <VolunteerDashboardView />
      ) : (
        <AdminDashboardView userRole={userRole} stats={stats} />
      )}
    </div>
  );
}
