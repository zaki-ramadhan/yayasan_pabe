"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ORG_PROFILE } from "@/data/orgProfile";
import { ShareDropdown } from "@/components/shared/ShareDropdown";
import { TeamAvatarStack } from "./TeamAvatarStack";
import { ASSET_PATHS } from "@/lib/assetConstants";

export function AboutHeader({ orgSettings = null, volunteerCount = 14 }) {
	const orgName = orgSettings?.name || ORG_PROFILE.name;
	const orgTagline =
		orgSettings?.tagline !== undefined && orgSettings?.tagline !== null
			? orgSettings.tagline
			: ORG_PROFILE.tagline;

	return (
		<section className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-2xs">
			{/* Cover Banner Image */}
			<div className="relative h-44 sm:h-56 lg:h-64 w-full bg-slate-900 overflow-hidden pointer-events-none select-none">
				<Image
					src={ASSET_PATHS.BANNERS.ABOUT_COVER}
					alt="Gedung dan Kantor Sekretariat Yayasan Payung Berkah"
					fill
					sizes="100vw"
					className="object-cover pointer-events-none select-none"
					style={{ objectPosition: "50% 28%" }}
					draggable={false}
					aria-hidden="true"
					priority
				/>
				{/* Darkening Overlay & Depth Gradient */}
				<div className="absolute inset-0 bg-slate-950/25 pointer-events-none select-none" />
				<div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-950/15 to-slate-950/20 pointer-events-none select-none" />
			</div>

			{/* Profile Details & Overlapping Rounded-Full Avatar */}
			<div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-0">
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3.5 -mt-12 sm:-mt-14 mb-3.5">
					{/* Logo Avatar Lingkaran (PFP) */}
					<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white bg-white shadow-md p-1.5 shrink-0 flex items-center justify-center overflow-hidden z-10">
						<Image
							src="/img/branding/logo-ypabe.webp"
							alt="Logo Resmi Yayasan PABE"
							fill
							sizes="(max-width: 640px) 96px, 112px"
							className="object-contain p-1 select-none pointer-events-none"
							draggable={false}
							priority
						/>
					</div>

					{/* Header Action Buttons */}
					<div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
						<Link href="/program">
							<Button className="h-9 sm:h-10 px-4 sm:px-5 text-xs sm:text-sm font-medium text-white bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 hover:from-slate-700 hover:via-slate-800 hover:to-slate-950 border-t border-t-slate-600 border-x border-x-slate-700 border-b-2 border-b-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_3px_6px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] transition-all cursor-pointer">
								Salurkan Donasi
							</Button>
						</Link>
						<Button
							type="button"
							variant="outline"
							onClick={() => {
								document.getElementById("rekening-resmi")?.scrollIntoView({
									behavior: "smooth",
								});
							}}
							className="h-9 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border-slate-300 transition-colors shadow-2xs cursor-pointer"
						>
							Rekening Resmi
						</Button>
						<Link href="/laporan">
							<Button
								variant="outline"
								className="h-9 sm:h-10 px-3.5 sm:px-4 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-100 border-slate-300 transition-colors shadow-2xs cursor-pointer"
							>
								Laporan Keuangan
							</Button>
						</Link>
						<ShareDropdown
							title={orgName}
							align="end"
							variant="icon"
							className="h-9 sm:h-10 w-9 sm:w-10 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 flex items-center justify-center shadow-2xs shrink-0"
						/>
					</div>
				</div>

				{/* Title and Meta Information */}
				<div className="space-y-1">
					<div className="flex items-center gap-2 flex-wrap">
						<h1 className="text-2xl sm:text-3xl font-medium text-slate-950 leading-tight">
							{orgName}
						</h1>
					</div>
					<p className="text-sm sm:text-base text-slate-700">
						{orgTagline}
					</p>

					{/* Avatar Stack Pengurus & Relawan */}
					<TeamAvatarStack
						volunteerCount={volunteerCount}
						leaders={ORG_PROFILE.leadership}
					/>
				</div>
			</div>
		</section>
	);
}
