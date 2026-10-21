/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DonorProfileCover } from "@/components/donor/DonorProfileCover";
import { DonorProfileNav } from "@/components/donor/DonorProfileNav";
import { DonorProfileSkeleton } from "@/components/donor/DonorProfileSkeleton";
import { DonorPersonalFormCard } from "@/components/donor/DonorPersonalFormCard";
import { DonorBankFormCard } from "@/components/donor/DonorBankFormCard";
import { DonorSecurityFormCard } from "@/components/donor/DonorSecurityFormCard";
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

  // Tab aktif: "personal" | "bank" | "security"
  const [activeTab, setActiveTab] = useState("personal");

  // Redirect guest to login
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated && typeof window !== "undefined") {
        const stored =
          localStorage.getItem("pabe_auth_user") ||
          localStorage.getItem("ygsm_auth_user");
        if (!stored) {
          router.replace("/login?redirect=/donatur/profil");
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
      const res = await safeFetch(
        `/api/user/profile?email=${encodeURIComponent(currentUser.email)}`
      );
      const json = await res.json();

      if (json.success && json.data) {
        setProfile(json.data);
      } else {
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

  // Handle profile updates (personal info / bank)
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
    return <DonorProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-sidebar rounded-md border border-slate-200/90 space-y-3 shadow-2xs">
        <p className="text-sm font-medium text-slate-600">
          Memuat data profil...
        </p>
        <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Unified Parent Profile Console (Identitas Avatar & Split Form dalam 1 Background Menyatu) */}
      <DonorProfileCover
        profile={profile}
        onUpdateImage={handleUpdateImage}
        isUpdating={isUpdatingImage}
      >
        {/* Split Kiri & Kanan di Bawah Avatar */}
        <div className="flex flex-col md:flex-row min-h-[460px]">
          {/* Kolom Kiri: Navigasi Teks Murni */}
          <aside className="w-full md:w-52 lg:w-60 shrink-0 border-b md:border-b-0 md:border-r border-slate-200/80 p-3 sm:p-4 bg-slate-100/50">
            <DonorProfileNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
            />
          </aside>

          {/* Kolom Kanan: Form Konten Aktif */}
          <main className="flex-1 p-5 sm:p-7 md:p-8 bg-sidebar min-w-0">
            {activeTab === "personal" && (
              <DonorPersonalFormCard
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                borderless
              />
            )}
            {activeTab === "bank" && (
              <DonorBankFormCard
                profile={profile}
                onUpdateProfile={handleUpdateProfile}
                borderless
              />
            )}
            {activeTab === "security" && (
              <DonorSecurityFormCard
                onUpdatePassword={handleUpdatePassword}
                borderless
              />
            )}
          </main>
        </div>
      </DonorProfileCover>
    </div>
  );
}
