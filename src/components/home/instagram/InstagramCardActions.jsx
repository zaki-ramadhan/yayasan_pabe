import { Button } from "@/components/ui/Button";
import { InstagramIcon } from "@/components/icons/SocialIcons";

/**
 * Tombol Aksi Tunggal (Follow di Instagram)
 * @param {object} account
 */
export function InstagramCardActions({ account }) {
  const profileUrl =
    account?.profileUrl ||
    `https://www.instagram.com/${(account?.username || "yayasanpayungberkah").replace("@", "")}/`;

  return (
    <div className="px-3 sm:px-3.5 pt-0.5">
      <Button
        asChild
        variant="default"
        className="w-full h-8.5 sm:h-9 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold transition-colors shadow-none cursor-pointer"
      >
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5"
        >
          <InstagramIcon className="w-3.5 h-3.5" />
          <span>Follow di Instagram</span>
        </a>
      </Button>
    </div>
  );
}
