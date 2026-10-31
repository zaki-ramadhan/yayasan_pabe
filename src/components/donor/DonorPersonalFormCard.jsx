"use client";

import { useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "@/hooks/useToast";
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

const PERSONAL_FIELD_SANITIZERS = {
  name: sanitizeName,
  bio: sanitizeBio,
  city: sanitizeCity,
  phone: sanitizePhone,
  address: sanitizeAddress,
};

export function DonorPersonalFormCard({
  profile,
  onUpdateProfile,
  id = "section-personal",
  borderless = false,
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const initialValues = useMemo(
    () => ({
      name: profile?.name || "",
      bio: profile?.bio || "",
      city: profile?.city || "",
      address: profile?.address || "",
      phone: profile?.phone || "",
    }),
    [profile?.name, profile?.bio, profile?.city, profile?.address, profile?.phone]
  );

  const validator = useCallback((vals) => {
    const nameValid = validateName(vals.name).isValid;
    const phoneValid = !vals.phone || validatePhone(vals.phone).isValid;
    return nameValid && phoneValid;
  }, []);

  const { bind, getCleanValues, isDirty, isValid } = useSanitizedForm(
    initialValues,
    PERSONAL_FIELD_SANITIZERS,
    validator
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPayload = getCleanValues();

    const newErrors = {};
    const nameValidation = validateName(cleanPayload.name);
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.message;
    }

    if (cleanPayload.phone) {
      const phoneValidation = validatePhone(cleanPayload.phone);
      if (!phoneValidation.isValid) {
        newErrors.phone = phoneValidation.message;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      const firstError = Object.values(newErrors)[0];
      toast({
        title: "Perhatian",
        description: firstError,
        variant: "destructive",
      });
      return;
    }
    setErrors({});

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
          Perbarui informasi identitas dan kontak Anda.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Nama lengkap" required error={errors.name}>
          <Input
            id="input-full-name"
            name="fullName"
            type="text"
            autoComplete="name"
            {...bind("name")}
            onChange={(e) => {
              bind("name").onChange(e);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            placeholder="Contoh: Hendra Wijaya"
            className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
            required
            maxLength={60}
          />
        </FormField>

        <FormField label="Bio / moto pribadi">
          <Textarea
            id="input-bio"
            name="bio"
            rows={2}
            {...bind("bio")}
            placeholder="Tuliskan moto atau harapan kebaikan Anda..."
            maxLength={200}
            className="rounded-md bg-white font-normal"
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <FormField label="Domisili / kota">
            <Input
              id="input-city"
              name="city"
              type="text"
              autoComplete="address-level2"
              {...bind("city")}
              placeholder="Contoh: Kota Bandung"
              maxLength={50}
              className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
            />
          </FormField>

          <FormField label="Nomor telepon / WhatsApp" error={errors.phone}>
            <Input
              id="input-phone"
              name="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              {...bind("phone")}
              onChange={(e) => {
                bind("phone").onChange(e);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="Contoh: 08123456789"
              maxLength={15}
              className="h-9.5 text-sm sm:text-sm rounded-md bg-white font-normal"
            />
          </FormField>
        </div>

        <FormField label="Alamat Lengkap">
          <Textarea
            id="input-address"
            name="address"
            rows={2}
            autoComplete="street-address"
            {...bind("address")}
            placeholder="Alamat domisili lengkap untuk keperluan konfirmasi penyaluran..."
            maxLength={250}
            className="rounded-md border-slate-200 bg-white"
          />
        </FormField>

        <div className="pt-2 flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || !isValid || isSaving}
            className="h-9 px-4 rounded-md text-sm font-medium gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
            <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
          </Button>
        </div>
      </form>
    </section>
  );
}
