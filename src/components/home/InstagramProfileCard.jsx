import { Card, CardContent } from "@/components/ui/Card";
import { InstagramProfileHeader } from "./instagram/InstagramProfileHeader";
import { InstagramProfileStats } from "./instagram/InstagramProfileStats";
import { InstagramMiniGrid } from "./instagram/InstagramMiniGrid";
import { InstagramCardActions } from "./instagram/InstagramCardActions";
import { InstagramCardSkeleton } from "./instagram/InstagramCardSkeleton";

// Re-export subcomponents for backward compatibility
export {
  InstagramProfileHeader,
  InstagramProfileStats,
  InstagramMiniGrid as InstagramProfileMiniGrid,
  InstagramCardActions as InstagramProfileActions,
  InstagramCardSkeleton as InstagramProfileCardSkeleton,
};

/**
 * Komponen Mini Tooltip Card Profil Instagram
 * Hanya menampilkan nama akun, username, foto profil (pfp), dan tombol aksi.
 *
 * @param {object} props
 * @param {object} props.account - Data akun profil yayasan
 */
export function InstagramProfileCard({ account }) {
  return (
    <div className="relative max-w-sm sm:max-w-md mx-auto w-full pt-2">
      {/* Tooltip Arrow Pointer */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-slate-900 border-t border-l border-slate-800 rotate-45 rounded-tl-[3px] z-20"
        aria-hidden="true"
      />

      <Card className="w-full rounded-xl bg-slate-900 text-white shadow-xl border-slate-800 overflow-hidden relative z-10">
        <CardContent className="p-0 py-3.5 sm:py-4 space-y-3">
          {/* Header Profile: Avatar (PFP), Username, Display Name */}
          <InstagramProfileHeader account={account} />

          {/* Tombol Aksi Kunjungi/Follow */}
          <InstagramCardActions account={account} />
        </CardContent>
      </Card>
    </div>
  );
}
