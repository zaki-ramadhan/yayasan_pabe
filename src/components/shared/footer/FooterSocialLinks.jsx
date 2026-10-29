import {
  FacebookIcon,
  InstagramIcon,
  YouTubeIcon,
  TikTokIcon,
  WhatsAppIcon,
} from "@/components/icons/SocialIcons";
import { ORG_PROFILE } from "@/data/orgProfile";
import { getFoundationWhatsAppUrl } from "@/lib/whatsappUtils";

/**
 * Social media links list for footer
 *
 * @param {object} props
 * @param {string} [props.whatsappUrl] - Custom WhatsApp consultation URL
 */
export function FooterSocialLinks({ whatsappUrl }) {
  const wa = whatsappUrl || getFoundationWhatsAppUrl();

  const socialLinks = [
    {
      name: "Facebook",
      href: ORG_PROFILE.socialMedia?.facebook || "https://web.facebook.com/payung.berkah.161",
      icon: FacebookIcon,
    },
    {
      name: "Instagram",
      href: ORG_PROFILE.socialMedia?.instagram || "https://www.instagram.com/yayasanpayungberkah/",
      icon: InstagramIcon,
    },
    {
      name: "TikTok",
      href: ORG_PROFILE.socialMedia?.tiktok || "https://www.tiktok.com/@yayasan.payung.be",
      icon: TikTokIcon,
    },
    {
      name: "YouTube",
      href: ORG_PROFILE.socialMedia?.youtube || "https://youtube.com/@yayasanpayungberkah9678?si=h15x9m5GMFpkwMVk",
      icon: YouTubeIcon,
    },
    {
      name: "WhatsApp",
      href: wa,
      icon: WhatsAppIcon,
    },
  ];

  return (
    <div className="pt-1.5 space-y-2">
      <span className="text-sm font-semibold uppercase tracking-wider text-white block">
        Media Sosial
      </span>
      <div className="flex items-center gap-2.5 text-white">
        {socialLinks.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8.5 h-8.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-white hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-200 hover:text-white"
              aria-label={item.name}
            >
              <Icon className="w-4.5 h-4.5" />
            </a>
          );
        })}
      </div>
    </div>
  );
}
