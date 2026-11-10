import { formatCompactNumber } from "@/lib/formatters";

/**
 * Statistik Akun Instagram (Postingan, Pengikut, Mengikuti)
 * @param {object} account
 * @param {number} [totalPostsCount]
 */
export function InstagramProfileStats({ account, totalPostsCount }) {
  return (
    <div className="grid grid-cols-3 text-center py-2 px-3 sm:px-3.5 border-t border-b border-slate-800/80">
      <div>
        <div className="font-semibold text-sm sm:text-base text-white tracking-tight">
          {formatCompactNumber(totalPostsCount ?? account?.postsCount ?? 0)}
        </div>
        <div className="text-sm text-white/90">
          postingan
        </div>
      </div>
      <div>
        <div className="font-semibold text-sm sm:text-base text-white tracking-tight">
          {account?.followersCount || "0"}
        </div>
        <div className="text-sm text-white/90">
          pengikut
        </div>
      </div>
      <div>
        <div className="font-semibold text-sm sm:text-base text-white tracking-tight">
          {formatCompactNumber(account?.followingCount || 0)}
        </div>
        <div className="text-sm text-white/90">
          mengikuti
        </div>
      </div>
    </div>
  );
}
