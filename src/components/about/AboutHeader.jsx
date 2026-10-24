"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ORG_PROFILE } from "@/data/orgProfile";
import { ShareDropdown } from "@/components/shared/ShareDropdown";
import { TeamAvatarStack } from "./TeamAvatarStack";

export function AboutHeader({ volunteerCount = 14 }) {
  return (
    <section className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-2xs">
      {/* Cover Banner Image */}
      <div className="relative h-40 sm:h-52 lg:h-60 w-full bg-slate-900 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1588072432836-e10032774350?w=1600&auto=format&fit=crop&q=80"
          alt="Kegiatan Pembinaan Santri Yayasan PABE"
          fill
          sizes="100vw"
          className="object-cover opacity-85"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />
      </div>

      {/* Profile Details & Overlapping Rounded-Full Avatar */}
      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3.5 -mt-12 sm:-mt-14 mb-3.5">
          {/* Logo Avatar */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-white shadow-md p-1.5 shrink-0 flex items-center justify-center overflow-hidden">
            <Image
              src="/logo_yayasan_GSM.png"
              alt="Logo Resmi Yayasan PABE"
              fill
              sizes="(max-width: 640px) 96px, 112px"
              className="object-contain p-1"
              priority
            />
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <Link href="/program">
              <Button className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium text-white bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 hover:from-slate-700 hover:via-slate-800 hover:to-slate-950 border-t border-t-slate-600 border-x border-x-slate-700 border-b-2 border-b-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_3px_6px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-all cursor-pointer">
                Salurkan Donasi
              </Button>
            </Link>
            <Link href="/laporan">
              <Button
                variant="outline"
                className="h-9 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                Laporan Keuangan
              </Button>
            </Link>
            <Link href="/distribusi">
              <Button
                variant="outline"
                className="h-9 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                Penyaluran Donasi
              </Button>
            </Link>
            <ShareDropdown
              title={ORG_PROFILE.name}
              align="end"
              variant="icon"
              className="h-9 sm:h-10 w-9 sm:w-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs shrink-0"
            />
          </div>
        </div>

        {/* Title and Meta Information */}
        <div className="space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-semibold text-slate-950 leading-tight">
                {ORG_PROFILE.name}
              </h1>
            </div>
            <p className="text-sm sm:text-base text-slate-700">
              {ORG_PROFILE.tagline}
            </p>

            {/* Avatar Stack Pengurus & Relawan */}
            <TeamAvatarStack
              volunteerCount={volunteerCount}
              leaders={ORG_PROFILE.leadership}
            />
          </div>

          {/* Metadata Bar */}
          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs sm:text-sm text-slate-700 pt-2 border-t border-slate-200">
            <span className="text-slate-800 font-medium">
              {ORG_PROFILE.contacts.cityProvince}
            </span>
            <span className="text-slate-300 select-none hidden sm:inline" aria-hidden="true">
              |
            </span>
            <span className="text-slate-800 font-medium">
              SK Kemenkumham: {ORG_PROFILE.legal.skKemenkumham}
            </span>
            <span className="text-slate-300 select-none hidden sm:inline" aria-hidden="true">
              |
            </span>
            <span className="text-emerald-700 font-medium">
              Audit KAP: Opini Wajar Tanpa Pengecualian (WTP)
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
