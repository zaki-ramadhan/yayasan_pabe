import {
  InstagramIcon,
  FacebookIcon,
  YouTubeIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/icons/SocialIcons";
import { ORG_PROFILE } from "@/data/orgProfile";

/**
 * Social media links list for footer
 *
 * @param {object} props
 * @param {string} [props.whatsappUrl] - Custom WhatsApp consultation URL
 */
export function FooterSocialLinks({ whatsappUrl }) {
  const cleanWa = (ORG_PROFILE.contacts.whatsapp || "").replace(/\D/g, "") || "6281284079912";
  const defaultWa = `https://wa.me/${cleanWa}?text=${encodeURIComponent("Assalamu'alaikum Admin Yayasan Payung Berkah, saya ingin bertanya seputar donasi & ZISWAF.")}`;
  const wa = whatsappUrl || defaultWa;

  return (
    <div className="pt-1.5 space-y-2">
      <span className="text-sm font-semibold uppercase tracking-wider text-white block">
        Media Sosial
      </span>
      <div className="flex items-center gap-2.5 text-white">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-white hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-200 hover:text-white"
          title="Instagram"
        >
          <InstagramIcon className="w-4.5 h-4.5" />
        </a>
        <a
          href="https://facebook.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-white hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-200 hover:text-white"
          title="Facebook"
        >
          <FacebookIcon className="w-4.5 h-4.5" />
        </a>
        <a
          href="https://youtube.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-white hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-200 hover:text-white"
          title="YouTube"
        >
          <YouTubeIcon className="w-4.5 h-4.5" />
        </a>
        <a
          href="https://tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-white hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-200 hover:text-white"
          title="TikTok"
        >
          <TikTokIcon className="w-4.5 h-4.5" />
        </a>
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-white hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-200 hover:text-white"
          title="WhatsApp"
        >
          <WhatsAppIcon className="w-4.5 h-4.5" />
        </a>
      </div>
    </div>
  );
}
