import { MapPointIcon } from "@solar-icons/react/line-duotone/map-point";
import { PhoneIcon } from "@solar-icons/react/line-duotone/phone";
import { LetterIcon } from "@solar-icons/react/line-duotone/letter";
import { ORG_PROFILE } from "@/data/orgProfile";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { getFoundationWhatsAppUrl, buildTelUrl } from "@/lib/whatsappUtils";

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
  const telUrl = buildTelUrl(contacts.phone);

  return (
    <div className="space-y-3.5">
      <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
        Kantor Layanan
      </h4>
      <div className="space-y-2.5 text-sm text-slate-200">
        <a
          href={contacts.mapsUrl || "https://maps.app.goo.gl/Qk73gn71SdQXYs6f8"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 text-slate-200 hover:text-white transition-colors group cursor-pointer"
          aria-label="Buka di Google Maps"
        >
          <MapPointIcon className="w-4 h-4 text-slate-300 shrink-0 mt-1 group-hover:scale-110 transition-transform" />
          <span className="leading-relaxed group-hover:underline underline-offset-2">{contacts.address}</span>
        </a>

        {contacts.phone && (
          <a
            href={telUrl}
            className="group flex items-center gap-2 text-slate-200 hover:text-white transition-colors"
            aria-label={`Telepon kantor: ${contacts.phone}`}
          >
            <PhoneIcon className="w-4 h-4 text-slate-300 shrink-0" />
            <span className="group-hover:underline underline-offset-2">{contacts.phone}</span>
          </a>
        )}

        {contacts.email && (
          <a
            href={`mailto:${contacts.email}`}
            className="group flex items-center gap-2 text-slate-200 hover:text-white transition-colors"
            aria-label={`Email: ${contacts.email}`}
          >
            <LetterIcon className="w-4 h-4 text-slate-300 shrink-0" />
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
