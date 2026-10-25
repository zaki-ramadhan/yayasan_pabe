import { BadgeCheck } from "lucide-react";

/**
 * Header Profil Instagram (Avatar, Nama, Handle, Verified Badge)
 * @param {object} account
 */
export function InstagramProfileHeader({ account }) {
  const initial =
    (account?.displayName || account?.username || "Y")[0]?.toUpperCase() || "Y";
  const username = (account?.handle || account?.username || "yayasanpayungberkah").replace("@", "");
  const displayName = account?.displayName || "Yayasan Payung Berkah";

  return (
    <div className="flex items-center gap-3.5 px-3 sm:px-3.5">
      {/* Circle Avatar dengan Story Gradient Ring */}
      <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full p-[2.7px] bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 shrink-0 shadow-sm">
        <div className="relative w-full h-full rounded-full border-2 border-slate-900 bg-slate-950 overflow-hidden flex items-center justify-center">
          {account?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={account.avatarUrl}
              alt={displayName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-semibold text-white text-sm sm:text-base">
              {initial}
            </span>
          )}
        </div>
      </div>

      {/* Detail Akun */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-white text-sm sm:text-base tracking-tight truncate">
            {username}
          </span>
          {Boolean(account?.isVerified) && (
            <BadgeCheck className="w-4 h-4 text-sky-400 fill-sky-400 text-slate-950 shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-300 font-normal truncate">
          {displayName}
        </p>
      </div>
    </div>
  );
}
