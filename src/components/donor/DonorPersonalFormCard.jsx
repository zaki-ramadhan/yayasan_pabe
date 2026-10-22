"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useSanitizedForm } from "@/hooks/useSanitizedForm";
import { cn } from "@/lib/utils";
import {
  sanitizeName,
  sanitizeCity,
  sanitizePhone,
  sanitizeBio,
  sanitizeAddress,
  validateName,
  validatePhone,
} from "@/lib/security";

export function DonorPersonalFormCard({
  profile,
  onUpdateProfile,
  id = "section-personal",
  borderless = false,
}) {
  const [isSaving, setIsSaving] = useState(false);

  const { bind, getCleanValues } = useSanitizedForm(
    {
      name: profile?.name || "",
      bio: profile?.bio || "",
      city: profile?.city || "",
      address: profile?.address || "",
      phone: profile?.phone || "",
    },
    {
      name: sanitizeName,
      bio: sanitizeBio,
      city: sanitizeCity,
      phone: sanitizePhone,
      address: sanitizeAddress,
    }
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPayload = getCleanValues();

    const nameValidation = validateName(cleanPayload.name);
    if (!nameValidation.isValid) {
      toast({
        title: "Perhatian",
        description: nameValidation.message,
        variant: "destructive",
      });
      return;
    }

    if (cleanPayload.phone) {
      const phoneValidation = validatePhone(cleanPayload.phone);
      if (!phoneValidation.isValid) {
        toast({
          title: "Perhatian",
          description: phoneValidation.message,
          variant: "destructive",
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      await onUpdateProfile(cleanPayload);
      toast({
        title: "Berhasil",
        description: "Informasi data diri berhasil diperbarui.",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Gagal Menyimpan",
        description: err.message || "Terjadi kesalahan saat menyimpan data diri.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section
      id={id}
      className={cn(
        "transition-all",
        borderless
          ? "bg-transparent p-0"
          : "rounded-md border border-slate-200/90 bg-sidebar p-5 sm:p-6 shadow-2xs"
      )}
    >
      <div className="pb-4 mb-5 border-b border-slate-200/80">
        <h2 className="text-base font-medium text-slate-950 leading-snug">
          Informasi Data Diri
        </h2>
        <p className="text-sm font-normal text-slate-500 mt-0.5">
          Kelola nama lengkap, kontak pribadi, serta alamat domisili Anda
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="input-full-name" className="text-sm font-medium text-slate-700 block mb-1.5">
            Nama Lengkap
          </label>
          <Input
            id="input-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            {...bind("name")}
            placeholder="Contoh: Hendra Wijaya"
            className="h-9.5 text-sm sm:text-sm rounded-md border-slate-200 bg-white"
            required
            maxLength={60}
          />
        </div>

        <div>
          <label htmlFor="input-bio" className="text-sm font-medium text-slate-700 block mb-1.5">
            Bio / Moto Pribadi
          </label>
          <textarea
            id="input-bio"
            name="bio"
            rows={2}
            {...bind("bio")}
            placeholder="Tuliskan moto atau harapan kebaikan Anda..."
            maxLength={200}
            className="w-full text-sm rounded-md border border-slate-200 p-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-slate-950 placeholder:text-slate-400 bg-white"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label htmlFor="input-city" className="text-sm font-medium text-slate-700 block mb-1.5">
              Domisili / Kota
            </label>
            <Input
              id="input-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              {...bind("city")}
              placeholder="Contoh: Kota Bandung"
              maxLength={50}
              className="h-9.5 text-sm sm:text-sm rounded-md border-slate-200 bg-white"
            />
          </div>

          <div>
            <label htmlFor="input-phone" className="text-sm font-medium text-slate-700 block mb-1.5">
              Nomor Telepon / WhatsApp
            </label>
            <Input
              id="input-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              {...bind("phone")}
              placeholder="Contoh: 08123456789"
              maxLength={15}
              className="h-9.5 text-sm sm:text-sm rounded-md border-slate-200 bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="input-address" className="text-sm font-medium text-slate-700 block mb-1.5">
            Alamat Lengkap
          </label>
          <textarea
            id="input-address"
            name="address"
            rows={2}
            autoComplete="street-address"
            {...bind("address")}
            placeholder="Alamat domisili lengkap untuk keperluan konfirmasi penyaluran..."
            maxLength={250}
            className="w-full text-sm rounded-md border border-slate-200 p-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-slate-950 placeholder:text-slate-400 bg-white"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="h-9 px-4 rounded-md text-sm font-medium gap-1.5 cursor-pointer"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            <span>Simpan Data Diri</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
