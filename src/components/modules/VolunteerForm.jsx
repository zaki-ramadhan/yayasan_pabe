/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VolunteerSuccessCard } from "@/components/volunteer/VolunteerSuccessCard";
import { getStoredUser } from "@/services/authService";
import { safeFetch } from "@/lib/safeFetch";
import {
  sanitizeName,
  sanitizePhone,
  sanitizeEmail,
  stripEmojis,
  validateName,
  validatePhone,
  validateEmail,
} from "@/lib/security";

const INTEREST_OPTIONS = [
  "Pengajar & Pembimbing Al-Qur'an",
  "Distribusi Logistik Tanggap Bencana",
  "Dokumentasi & Tim Media Kreatif",
  "Layanan Kesehatan & Medis",
  "Pendampingan Wirausaha Yatim",
];

const DRAFT_STORAGE_KEY = "pabe_volunteer_draft";

export function VolunteerForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [interest, setInterest] = useState(INTEREST_OPTIONS[0]);
  const [motivation, setMotivation] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Restore draft if user refreshed the page or experienced disconnect
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.fullName) setFullName(parsed.fullName);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.city) setCity(parsed.city);
        if (parsed.interest) setInterest(parsed.interest);
        if (parsed.motivation) setMotivation(parsed.motivation);
      }
    } catch {
      // ignore
    }
  }, []);

  // Auto-save draft on every change
  useEffect(() => {
    try {
      if (fullName || phone || email || city || motivation) {
        sessionStorage.setItem(
          DRAFT_STORAGE_KEY,
          JSON.stringify({ fullName, phone, email, city, interest, motivation })
        );
      }
    } catch {
      // ignore
    }
  }, [fullName, phone, email, city, interest, motivation]);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) return;

    queueMicrotask(() => {
      if (user.name && user.name !== "Pengguna Google" && user.name !== "Pengguna Facebook") {
        setFullName((prev) => prev || user.name);
      }
      if (user.phone && user.phone !== "-") {
        const cleanPhone = sanitizePhone(user.phone);
        if (cleanPhone) {
          setPhone((prev) => prev || cleanPhone);
        }
      }
      if (user.email && !user.email.endsWith("@google.user") && !user.email.endsWith("@facebook.user")) {
        setEmail((prev) => prev || user.email);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameVal = validateName(fullName);
    if (!nameVal.isValid) {
      toast.error(nameVal.message);
      return;
    }

    const phoneVal = validatePhone(phone);
    if (!phoneVal.isValid) {
      toast.error(phoneVal.message);
      return;
    }

    if (email) {
      const emailVal = validateEmail(email);
      if (!emailVal.isValid) {
        toast.error(emailVal.message);
        return;
      }
    }

    const cleanCity = stripEmojis(city).replace(/[^a-zA-ZÀ-ÿ\s.,'\-]/g, "").trim();
    if (!cleanCity || cleanCity.length < 2) {
      toast.error("Mohon masukkan kota / kabupaten domisili yang valid.");
      return;
    }

    try {
      setLoading(true);
      const res = await safeFetch("/api/volunteers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: nameVal.sanitized,
          phone: phoneVal.sanitized,
          email: email ? validateEmail(email).sanitized : "",
          city: cleanCity,
          interest,
          motivation: stripEmojis(motivation).slice(0, 500),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal mengirim pendaftaran.");
      }

      sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      setIsSubmitted(true);
      toast.success(json.message || "Pendaftaran relawan berhasil dikirim!");
    } catch (err) {
      toast.error(err.message || "Gagal mengirim pendaftaran relawan.");
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return <VolunteerSuccessCard />;
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl border border-border-subtle space-y-4 shadow-sm">
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-800 block">Nama Lengkap <span className="text-rose-500">*</span></label>
        <Input
          type="text"
          required
          value={fullName}
          maxLength={60}
          onChange={(e) => setFullName(sanitizeName(e.target.value))}
          placeholder="Nama Anda"
          className="h-11"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 block">Nomor WhatsApp <span className="text-rose-500">*</span></label>
          <Input
            type="tel"
            inputMode="tel"
            required
            value={phone}
            maxLength={15}
            onChange={(e) => setPhone(sanitizePhone(e.target.value))}
            placeholder="0812xxxxxxxx"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 block">Email</label>
          <Input
            type="email"
            value={email}
            maxLength={100}
            onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
            placeholder="email@anda.com"
            className="h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 block">Kota / Kabupaten Domisili <span className="text-rose-500">*</span></label>
          <Input
            type="text"
            required
            value={city}
            maxLength={50}
            onChange={(e) => setCity(stripEmojis(e.target.value).replace(/[^a-zA-ZÀ-ÿ\s.,'\-]/g, "").slice(0, 50))}
            placeholder="Contoh: Bogor / Jakarta"
            className="h-11"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-800 block">Peminatan Aksi <span className="text-rose-500">*</span></label>
          <select
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            className="w-full h-11 px-3 text-sm rounded-lg border border-border-strong bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {INTEREST_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-slate-800 block">Motivasi &amp; Pengalaman Singkat</label>
        <textarea
          rows={3}
          value={motivation}
          maxLength={500}
          onChange={(e) => setMotivation(stripEmojis(e.target.value).slice(0, 500))}
          placeholder="Ceritakan keahlian atau alasan Anda ingin bergabung..."
          className="w-full rounded-lg border border-border-strong bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 font-semibold">
        {loading ? "Mengirim Pendaftaran..." : "Daftar sebagai relawan PABE"}
      </Button>
    </form>
  );
}
