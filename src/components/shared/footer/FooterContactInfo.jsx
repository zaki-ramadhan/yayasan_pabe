import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";
import { ORG_PROFILE } from "@/data/orgProfile";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import {
  getFoundationWhatsAppUrl,
  getCustomerServices,
  buildTelUrl,
  buildWhatsAppUrl,
} from "@/lib/whatsappUtils";

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
  const wa = whatsappUrl || getFoundationWhatsAppUrl();
  const customerServices = getCustomerServices();
  const telUrl = buildTelUrl(contacts.phone);

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
          aria-label="Buka di Google Maps"
        >
          <MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
          <span className="leading-relaxed group-hover:underline underline-offset-2">{contacts.address}</span>
        </a>

        {contacts.phone && (
          <a
            href={telUrl}
            className="group flex items-center gap-2 text-slate-200 hover:text-white transition-colors"
            aria-label={`Telepon kantor: ${contacts.phone}`}
          >
            <Phone className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="group-hover:underline underline-offset-2">{contacts.phone}</span>
          </a>
        )}

        {customerServices.map((cs) => (
          <a
            key={cs.id}
            href={buildWhatsAppUrl(cs.phone, cs.defaultMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-slate-200 hover:text-white transition-colors"
            aria-label={`WhatsApp: ${cs.phone}`}
          >
            <WhatsAppIcon className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 shrink-0 transition-colors" />
            <span className="group-hover:underline underline-offset-2">{cs.phone}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
          </a>
        ))}

        {contacts.email && (
          <a
            href={`mailto:${contacts.email}`}
            className="group flex items-center gap-2 text-slate-200 hover:text-white transition-colors"
            aria-label={`Email: ${contacts.email}`}
          >
            <Mail className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="group-hover:underline underline-offset-2">{contacts.email}</span>
          </a>
        )}
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
