"use client";

import { useState, useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { INSTAGRAM_ACCOUNT as DEFAULT_ACCOUNT } from "@/data/instagramPosts";
import { InstagramProfileCard } from "@/components/home/InstagramProfileCard";
import { CurvedLoop } from "@/components/ui/CurvedLoop";
import { InstagramIcon } from "@/components/icons/SocialIcons";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { InstagramFeedFilter } from "./instagram/InstagramFeedFilter";
import { InstagramPhotoGrid } from "./instagram/InstagramPhotoGrid";

export function HomeInstagramFeed({ posts = [], account = DEFAULT_ACCOUNT }) {
  const [filterType, setFilterType] = useState("popular");
  const currentAccount = account || DEFAULT_ACCOUNT;

  // Dynamic sorting: "Terpopuler" (likes + comments) vs "Terbaru" (timestamp)
  const sortedPosts = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return [];
    const cloned = [...posts];

    if (filterType === "popular") {
      cloned.sort((a, b) => {
        const scoreA = (a.likes || 0) + (a.comments || 0);
        const scoreB = (b.likes || 0) + (b.comments || 0);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.timestamp || 0) - (a.timestamp || 0);
      });
    } else {
      cloned.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    return cloned.slice(0, 9);
  }, [posts, filterType]);

  const hasPosts = sortedPosts.length > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <SectionHeader
        title="Follow Kami di Instagram"
        subtitle="Aktivitas pembinaan anak yatim, penyaluran amanah zakat, dan aksi kemanusiaan terkini."
        align="center"
      />

      {/* Profile Card Container with Animated CurvedLoop Decorative Backdrop */}
      <div className="relative py-4 sm:py-6 overflow-hidden flex items-center justify-center">
        {/* Curved Loop Background Multi-layer */}
        <div className="absolute inset-0 flex flex-col items-center justify-center -z-0 pointer-events-none select-none opacity-100 scale-105 sm:scale-100">
          {Array.from({ length: 5 }).map((_, idx) => (
            <CurvedLoop
              key={idx}
              marqueeText="DOKUMENTASI KEGIATAN & KABAR TERKINI ✦ BERBAGI KEBAIKAN TANPA BATAS ✦"
              speed={0.7}
              curveAmount={-320}
              direction={idx % 2 === 0 ? "left" : "right"}
              interactive={false}
              className="fill-slate-200/60 font-slate-950"
            />
          ))}
        </div>

        {/* Modular Compact Instagram Profile Preview Card */}
        <div className="relative z-10 w-full flex justify-center">
          <InstagramProfileCard account={currentAccount} posts={posts} />
        </div>
      </div>

      {/* Switch Toggle: [Terbaru] ( O ) [Terpopuler] */}
      {hasPosts && (
        <InstagramFeedFilter
          filterType={filterType}
          onFilterChange={setFilterType}
        />
      )}

      {/* Konten Feed: Photo Grid vs Empty State */}
      {hasPosts ? (
        <InstagramPhotoGrid posts={sortedPosts} account={currentAccount} />
      ) : (
        <EmptyState
          variant="dashed"
          icon={InstagramIcon}
          title="Belum ada postingan yang disorot"
          description="Ikuti akun resmi kami di Instagram untuk melihat dokumentasi kegiatan anak asuh, penyaluran donasi, dan informasi terkini."
          action={
            <a
              href={currentAccount.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-emerald-700 underline underline-offset-4 transition-colors"
            >
              <span>Kunjungi profil {currentAccount.username}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          }
          className="bg-slate-50/60 p-8 sm:p-12"
        />
      )}
    </section>
  );
}
