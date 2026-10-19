/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DonorProfileCover } from "@/components/donor/DonorProfileCover";
import { DonorProfileForm } from "@/components/donor/DonorProfileForm";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { safeFetch } from "@/lib/safeFetch";

export function DonorProfileView() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser, isAuthenticated, updateLocalUser } = useCurrentUser();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingImage, setIsUpdatingImage] = useState(false);

  // Redirect guest to login
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated && typeof window !== "undefined") {
        const stored = localStorage.getItem("pabe_auth_user") || localStorage.getItem("ygsm_auth_user");
        if (!stored) {
          router.replace("/login?redirect=/profil");
        }
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // Load database profile
  const fetchProfile = useCallback(async () => {
    if (!currentUser?.email) return;

    setIsLoading(true);
    try {
      const res = await safeFetch(`/api/user/profile?email=${encodeURIComponent(currentUser.email)}`);
      const json = await res.json();

      if (json.success && json.data) {
        setProfile(json.data);
      } else {
        // Fallback to current session object if not yet seeded
        setProfile(currentUser);
      }
    } catch (err) {
      console.error("Gagal memuat profil database:", err);
      setProfile(currentUser);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.email) {
      fetchProfile();
    }
  }, [currentUser?.email, fetchProfile]);

  // Handle profile updates (personal info / bank / images)
  const handleUpdateProfile = async (profileData) => {
    if (!currentUser?.email) throw new Error("Sesi login berakhir.");

    const res = await safeFetch("/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: currentUser.email,
        profileData,
      }),
      timeoutMs: 12000,
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || "Gagal memperbarui profil.");
    }

    setProfile(json.data);

    // Sync with navbar & session
    updateLocalUser({
      name: json.data.name,
      salutation: json.data.salutation,
      avatar: json.data.avatar,
      phone: json.data.phone,
    });

    return json.data;
  };

  // Handle Cover / Avatar image update
  const handleUpdateImage = async (imageUpdate) => {
    setIsUpdatingImage(true);
    try {
      await handleUpdateProfile(imageUpdate);
      toast({
        title: "Berhasil",
        description: "Foto berhasil diperbarui.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Mengubah Foto",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdatingImage(false);
    }
  };

  // Handle password update
  const handleUpdatePassword = async ({ oldPassword, newPassword }) => {
    if (!currentUser?.email) throw new Error("Sesi login berakhir.");

    const res = await safeFetch("/api/user/password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: currentUser.email,
        oldPassword,
        newPassword,
      }),
      timeoutMs: 12000,
    });

    const json = await res.json();
    if (!json.success) {
      throw new Error(json.message || "Gagal memperbarui kata sandi.");
    }

    return json;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Skeleton Cover Banner */}
        <div className="h-56 sm:h-72 bg-slate-200 rounded-md" />
        <div className="h-64 bg-white rounded-md border border-slate-200 p-6 space-y-4">
          <div className="h-6 bg-slate-200 rounded-sm w-48" />
          <div className="h-4 bg-slate-100 rounded-sm w-64" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="h-10 bg-slate-100 rounded-md" />
            <div className="h-10 bg-slate-100 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-white rounded-md border border-slate-200 space-y-3">
        <p className="text-sm font-medium text-slate-600">
          Memuat data profil donatur...
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Facebook-style Cover Banner & Header */}
      <DonorProfileCover
        profile={profile}
        onUpdateImage={handleUpdateImage}
        isUpdating={isUpdatingImage}
      />

      {/* Forms Section: Personal Info, Bank Account, Password */}
      <DonorProfileForm
        profile={profile}
        onUpdateProfile={handleUpdateProfile}
        onUpdatePassword={handleUpdatePassword}
      />
    </div>
  );
}
