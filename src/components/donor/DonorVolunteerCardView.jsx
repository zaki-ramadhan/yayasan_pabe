"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Printer, Copy, Check, ExternalLink, Clock, UserCheck } from "lucide-react";
import { VolunteerIdCard } from "@/components/volunteer/VolunteerIdCard";
import { CampaignCTA } from "@/components/campaign/CampaignCTA";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { copyToClipboard } from "@/lib/clipboard";
import { safeFetch } from "@/lib/safeFetch";
import { toast } from "@/hooks/useToast";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function DonorVolunteerCardView() {
  const { currentUser } = useCurrentUser();
  const [volunteer, setVolunteer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadVolunteer() {
      if (!currentUser?.email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const res = await safeFetch(`/api/donor/volunteer?email=${encodeURIComponent(currentUser.email)}`);
        const json = await res.json();
        if (json.success && json.data) {
          setVolunteer(json.data);
        } else {
          setVolunteer(null);
        }
      } catch {
        toast.error("Gagal memuat status keanggotaan relawan.");
      } finally {
        setIsLoading(false);
      }
    }

    loadVolunteer();
  }, [currentUser?.email]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = async () => {
    if (!volunteer?.id) return;
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/relawan/validasi/${volunteer.id}`
      : `https://payungberkah.id/relawan/validasi/${volunteer.id}`;

    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      toast.success("Tautan validasi relawan berhasil disalin.");
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("Gagal menyalin tautan.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 animate-pulse">
        {/* Skeleton Banner Atas */}
        <Skeleton className="h-32 sm:h-28 w-full rounded-md" />

        {/* Skeleton Empty State Card */}
        <div className="p-8 sm:p-12 bg-white rounded-xl border border-slate-200 text-center space-y-4 shadow-2xs">
          <Skeleton className="w-56 h-56 sm:w-72 sm:h-72 mx-auto rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-48 mx-auto rounded" />
            <Skeleton className="h-4 w-72 max-w-full mx-auto rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* 1. Banner CTA di Atas (Hanya jika belum terdaftar relawan) */}
      {!volunteer && (
        <CampaignCTA
          title="Tertarik Menjadi Relawan Kebaikan?"
          description="Salurkan keahlian dan waktu Anda dalam program sosial, pendidikan Al-Qur'an, dan aksi kemanusiaan bersama Yayasan Payung Berkah."
          buttonText="Daftar Jadi Relawan Sekarang"
          buttonHref="/volunteer"
          ignoreAuthCheck={true}
          variant="emerald"
          campaign={{
            bannerUrl:
              "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
          }}
          className="mt-0"
        />
      )}

      {/* 2. Heading Halaman (Hanya muncul jika sudah ada data relawan/pending) */}
      {volunteer && (
        <div>
          <h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-950">
            Kartu Relawan
          </h1>
          <p className="text-sm font-normal text-slate-500 mt-0.5">
            Identitas resmi personel relawan aksi lapangan yayasan
          </p>
        </div>
      )}

      {/* 3. Konten Utama Sesuai Status Keanggotaan */}
      {volunteer && volunteer.isApproved ? (
        // Kasus 1: Relawan Aktif (APPROVED)
        <div className="space-y-6">
          <div className="p-4 sm:p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-950 text-sm sm:text-base">
                  Kartu Tanda Anggota (KTA) Aktif
                </h3>
                <p className="text-xs sm:text-sm text-emerald-800">
                  Gunakan kartu fisik atau digital ini sebagai identitas resmi saat bertugas di lapangan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={handleCopyLink}
                className="h-9 px-3 text-xs sm:text-sm font-normal gap-1.5 cursor-pointer bg-white flex-1 sm:flex-initial"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                <span>{copied ? "Tersalin" : "Salin tautan"}</span>
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                className="h-9 px-3.5 text-xs sm:text-sm font-medium gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer flex-1 sm:flex-initial"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak kartu</span>
              </Button>
            </div>
          </div>

          {/* Display KTA Card with QR */}
          <div className="py-2">
            <VolunteerIdCard volunteer={volunteer} />
          </div>

          <div className="text-center">
            <Link
              href={`/relawan/validasi/${volunteer.id}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 hover:underline font-medium"
            >
              <span>Uji coba tampilan scan QR publik</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : volunteer && volunteer.status === "PENDING" ? (
        // Kasus 2: Menunggu Verifikasi Pengurus (PENDING)
        <div className="max-w-lg mx-auto p-6 bg-white rounded-xl border border-amber-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-slate-950 text-base">
            Pendaftaran Relawan Sedang Diverifikasi
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Terima kasih telah mendaftar di bidang <strong>{volunteer.interest}</strong>. Tim pengurus yayasan sedang meninjau berkas pendaftaran Anda. KTA resmi akan diterbitkan setelah disetujui.
          </p>
        </div>
      ) : (
        // Kasus 3: Belum Terdaftar sebagai Relawan (Empty State dengan Aset Gambar)
        <div className="p-8 sm:p-12 bg-white rounded-xl border border-slate-200 text-center space-y-3 shadow-2xs">
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 mx-auto pointer-events-none select-none">
            <Image
              src="/img/illustrations/empty-state.webp"
              alt=""
              fill
              sizes="(max-width: 640px) 224px, 288px"
              className="object-contain pointer-events-none select-none"
              draggable={false}
              aria-hidden="true"
              priority
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              Kartu Relawan Belum Tersedia
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
              Daftar melalui banner di atas untuk mendapatkan Kartu Tanda Anggota (KTA) resmi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
