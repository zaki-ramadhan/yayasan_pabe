import { MapPin, Phone, Mail } from "lucide-react";
import { ORG_PROFILE } from "@/data/orgProfile";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";

/**
 * Contact details and WhatsApp consultation button for footer
 *
 * @param {object} props
 * @param {object} [props.contacts] - Contact info object
 * @param {string} [props.whatsappUrl] - Custom WhatsApp consultation URL
 */
export function FooterContactInfo({
  contacts = ORG_PROFILE.contacts,
  whatsappUrl,
}) {
  const defaultWa = `https://wa.me/6281234567890?text=${encodeURIComponent("Assalamu'alaikum Admin Yayasan PABE, saya ingin bertanya seputar donasi & ZISWAF.")}`;
  const wa = whatsappUrl || defaultWa;

  return (
    <div className="space-y-3.5">
      <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
        Kantor Layanan
      </h4>
      <div className="space-y-2.5 text-sm text-slate-200">
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(contacts.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 text-slate-200 hover:text-white transition-colors group cursor-pointer"
          title="Buka di Google Maps"
        >
          <MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
          <span className="leading-relaxed">{contacts.address}</span>
        </a>
        <div className="flex items-center gap-2 text-slate-200">
          <Phone className="w-4 h-4 text-slate-300 shrink-0" />
          <span>{contacts.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-200">
          <Mail className="w-4 h-4 text-slate-300 shrink-0" />
          <span>{contacts.email}</span>
        </div>
      </div>

      {/* WhatsApp Consultation Button */}
      <div className="pt-1.5">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors shadow-sm cursor-pointer"
        >
          <WhatsAppIcon className="w-4.5 h-4.5 shrink-0" />
          <span>Konsultasi Zakat &amp; Donasi</span>
        </a>
      </div>
    </div>
  );
}
