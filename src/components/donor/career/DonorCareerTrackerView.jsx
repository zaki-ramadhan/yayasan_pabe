/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchUserCareerApplications,
  cancelCareerApplication,
} from "@/services/careerClientService";
import { DonorCareerCardItem } from "./DonorCareerCardItem";
import { DonorCareerEmptyState } from "./DonorCareerEmptyState";
import { DonorCareerSkeleton } from "./DonorCareerSkeleton";
import { DataFetchErrorState } from "@/components/shared/DataFetchErrorState";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { toast } from "@/hooks/useToast";

export function DonorCareerTrackerView() {
  const { currentUser } = useCurrentUser();
  const userEmail = currentUser?.email || "";

  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
      setError(null);
    }
    const res = await fetchUserCareerApplications(userEmail);
    if (res.success) {
      setApplications(res.data);
    } else if (!silent) {
      setError(res.message || "Gagal memuat status lamaran kerja.");
    }
    if (!silent) {
      setIsLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const handleSync = () => {
      if (document.visibilityState === "visible") {
        load(true);
      }
    };
    document.addEventListener("visibilitychange", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      document.removeEventListener("visibilitychange", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, [load]);

  const handleCancel = async (applicationId) => {
    const res = await cancelCareerApplication(applicationId);
    if (res.success) {
      toast.success(res.message);
      setApplications((prev) => prev.filter((a) => a.id !== applicationId));
    } else {
      toast.error(res.message);
    }
  };

  if (isLoading) {
    return <DonorCareerSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <DataFetchErrorState
          title="Gagal Memuat Status Lamaran"
          description={error}
          onRetry={() => load(false)}
          compact
        />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {applications.length === 0 ? (
        <DonorCareerEmptyState />
      ) : (
        <div className="space-y-3.5">
          {applications.map((app) => (
            <DonorCareerCardItem
              key={app.id}
              application={app}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

