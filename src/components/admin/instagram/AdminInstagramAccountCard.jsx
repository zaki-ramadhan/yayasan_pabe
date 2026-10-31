"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import { toast } from "@/hooks/useToast";
import { safeFetch } from "@/lib/safeFetch";
import { uploadFileToServer } from "@/services/uploadService";
import { isFormDirty } from "@/lib/formUtils";

/**
 * Form pengaturan profil akun resmi Instagram yayasan (inline langsung di halaman).
 *
 * @param {object} props
 * @param {object} props.profile - Data profil saat ini
 * @param {Function} props.onSaveProfile - Callback saat profil sukses diperbarui
 */
export function AdminInstagramAccountCard({ profile, onSaveProfile }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (profile) {
      setUsername((profile.username || "yayasanpayungberkah").replace("@", ""));
      setDisplayName(profile.displayName || "Yayasan Payung Berkah");
      setAvatarUrl(profile.avatarUrl || "");
    }
  }, [profile]);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "warning",
        title: "Ukuran foto melebihi batas",
        description: "Batas maksimal ukuran foto profil adalah 5MB.",
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const res = await uploadFileToServer({
        file,
        context: "USER_AVATAR",
      });

      if (res?.url) {
        setAvatarUrl(res.url);
      }
    } catch {
      toast.error("Gagal mengunggah foto avatar.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleUsernameChange = (e) => {
    const val = e.target.value
      .replace(/[@\s]/g, "")
      .replace(/[^a-zA-Z0-9._]/g, "")
      .toLowerCase()
      .slice(0, 30);
    setUsername(val);
  };

  const handleUsernameBlur = () => {
    setUsername((prev) => prev.trim().slice(0, 30));
  };

  const handleDisplayNameChange = (e) => {
    const val = e.target.value
      .replace(/^\s+/, "")
      .replace(/\s{2,}/g, " ")
      .slice(0, 50);
    setDisplayName(val);
  };

  const handleDisplayNameBlur = () => {
    setDisplayName((prev) => prev.trim().slice(0, 50));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanUsername = username.replace(/[@\s]/g, "").trim().slice(0, 30);
    if (!cleanUsername) {
      toast.error("Username Instagram wajib diisi.");
      return;
    }

    const cleanDisplayName = displayName.trim().replace(/\s{2,}/g, " ").slice(0, 50) || cleanUsername;

    setIsSubmitting(true);
    try {
      const payload = {
        username: cleanUsername,
        displayName: cleanDisplayName,
        avatarUrl: avatarUrl ? avatarUrl.trim() : null,
        profileUrl: `https://www.instagram.com/${cleanUsername}/`,
        isVerified: Boolean(profile?.isVerified),
      };

      const res = await safeFetch("/api/admin/instagram/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast.success("Profil akun Instagram berhasil diperbarui.");
        if (onSaveProfile) onSaveProfile(json.data);
        router.refresh();
      } else {
        toast.error(json.message || "Gagal memperbarui profil.");
      }
    } catch {
      toast.error("Terjadi kendala jaringan saat menyimpan profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = isFormDirty(
    {
      username: (profile?.username || "yayasanpayungberkah").replace("@", ""),
      displayName: profile?.displayName || "Yayasan Payung Berkah",
      avatarUrl: profile?.avatarUrl || "",
    },
    {
      username,
      displayName,
      avatarUrl,
    }
  );

  const isFormValid = username.trim().length >= 3 && displayName.trim().length >= 2;

  const initial = (displayName || username || "Y")[0].toUpperCase();

  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardContent className="p-5 sm:p-6">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            {/* Foto Avatar Profil */}
            <div className="relative shrink-0">
              <div
                onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
                className={cn(
                  "w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative group cursor-pointer hover:border-primary/60 transition-all shadow-2xs",
                  isUploadingAvatar && "opacity-60 pointer-events-none"
                )} aria-label="Ganti foto avatar"
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName || "Avatar"}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <span className="font-bold text-slate-700 text-2xl sm:text-3xl select-none">{initial}</span>
                )}
              </div>

              {/* Tombol Icon Edit / Ganti Avatar */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-primary text-white flex items-center justify-center border-2 border-white shadow-md hover:bg-primary/90 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:pointer-events-none"
                aria-label="Ganti foto avatar"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarFileChange}
                className="hidden"
              />
            </div>

            {/* Form Fields & Tombol Simpan (Sejajar dengan kotak input) */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-1 w-full min-w-0">
              {/* Input Form Fields: Username & Nama Akun */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-w-0">
                <FormField label="Username Instagram" required>
                  <Input
                    type="text"
                    value={username}
                    onChange={handleUsernameChange}
                    onBlur={handleUsernameBlur}
                    placeholder="yayasanpayungberkah"
                    maxLength={30}
                    required
                    autoComplete="off"
                  />
                </FormField>

                <FormField label="Nama Akun Instagram" required>
                  <Input
                    type="text"
                    value={displayName}
                    onChange={handleDisplayNameChange}
                    onBlur={handleDisplayNameBlur}
                    placeholder="Yayasan Payung Berkah"
                    maxLength={50}
                    required
                    autoComplete="off"
                  />
                </FormField>
              </div>

              {/* Tombol Simpan */}
              <div className="shrink-0 w-full sm:w-auto">
                <Button
                  type="submit"
                  disabled={!hasChanges || !isFormValid || isSubmitting || isUploadingAvatar}
                  className="h-10 px-5 text-sm font-medium gap-2 cursor-pointer shadow-2xs w-full sm:w-auto disabled:cursor-not-allowed"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                  <span>{isSubmitting ? "Menyimpan..." : "Simpan"}</span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
