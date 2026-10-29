"use client";

import { useMemo } from "react";
import { ArrowUpRight } from "lucide-react";
import { INSTAGRAM_ACCOUNT as DEFAULT_ACCOUNT } from "@/data/instagramPosts";
import { InstagramProfileCard } from "@/components/home/InstagramProfileCard";
import { InstagramIcon } from "@/components/icons/SocialIcons";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { InstagramPhotoGrid } from "./instagram/InstagramPhotoGrid";

export function HomeInstagramFeed({ posts = [], account = DEFAULT_ACCOUNT }) {
  const currentAccount = account || DEFAULT_ACCOUNT;

  const sortedPosts = useMemo(() => {
    if (!Array.isArray(posts) || posts.length === 0) return [];
    return [...posts]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 9);
  }, [posts]);

  const hasPosts = sortedPosts.length > 0;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <SectionHeader
        title="Follow Kami di Instagram"
        subtitle="Aktivitas pembinaan anak yatim, penyaluran amanah zakat, dan aksi kemanusiaan terkini."
        align="center"
      />

      <div className="relative py-2 sm:py-3 flex items-center justify-center">
        <div className="relative z-10 w-full flex justify-center">
          <InstagramProfileCard account={currentAccount} />
        </div>
      </div>

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

export { HomeInstagramSkeleton } from "./HomeInstagramSkeleton";
export default HomeInstagramFeed;
