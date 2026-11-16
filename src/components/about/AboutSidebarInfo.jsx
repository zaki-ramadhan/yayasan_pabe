import { CheckCircleIcon } from "@solar-icons/react/bold/check-circle";
import { PhoneIcon } from "@solar-icons/react/line-duotone/phone";
import { LetterIcon } from "@solar-icons/react/line-duotone/letter";
import { ClockCircleIcon } from "@solar-icons/react/line-duotone/clock-circle";
import { MapPointIcon } from "@solar-icons/react/line-duotone/map-point";
import { ArrowRightUpIcon } from "@solar-icons/react/linear/arrow-right-up";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { ORG_PROFILE } from "@/data/orgProfile";
import { buildWhatsAppUrl, buildTelUrl } from "@/lib/whatsappUtils";

export function AboutSidebarInfo({ orgSettings = null }) {
  const legal = {
    ...ORG_PROFILE.legal,
    ...(orgSettings?.legal || {}),
  };
  const contacts = {
    ...ORG_PROFILE.contacts,
    ...(orgSettings?.contacts || {}),
  };

  const whatsappUrl = buildWhatsAppUrl(
    contacts.whatsapp,
    "Assalamu'alaikum Bapak/Ibu pengurus Yayasan Payung Berkah, saya ingin bertanya seputar yayasan dan donasi."
  );

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-300 space-y-4 shadow-2xs">
      {/* 1. Legalitas Resmi Lembaga */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-slate-950 text-base">
            Legalitas Resmi
          </h3>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-primary">
                Akta Notaris
              </span>
              <a
                href="/legalitas/akta-notaris"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline transition-colors" aria-label="Buka salinan akta notaris di tab baru"
              >
                <span>Lihat salinan</span>
                <ArrowRightUpIcon className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
            <p className="font-medium text-slate-900 mt-0.5">
              {legal.aktaNotaris}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-primary block">
              SK Menkumham RI
            </span>
            <p className="font-medium text-slate-900 mt-0.5">
              {legal.skKemenkumham}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-primary">
                Izin Kegiatan LKS (PMPTSP / Dinsos)
              </span>
              <a
                href="/legalitas/izin-lks"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline transition-colors" aria-label="Buka salinan izin LKS Dinas Sosial di tab baru"
              >
                <span>Lihat salinan</span>
                <ArrowRightUpIcon className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
            <p className="font-medium text-slate-900 mt-0.5">
              {legal.izinIzinSosial}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-primary">
                Surat Keterangan Domisili
              </span>
              <a
                href="/legalitas/surat-domisili"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 hover:underline transition-colors" aria-label="Buka salinan surat domisili di tab baru"
              >
                <span>Lihat salinan</span>
                <ArrowRightUpIcon className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
            <p className="font-medium text-slate-900 mt-0.5">
              {legal.suratDomisili}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-primary block">
              Nomor Pokok Wajib Pajak (NPWP)
            </span>
            <p className="font-medium text-slate-900 mt-0.5 font-mono">
              {legal.npwp}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-sm font-medium text-primary block">
              Kepatuhan &amp; Akuntabilitas
            </span>
            <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{legal.statusLks} ({legal.lingkupKerja})</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 text-sm font-medium">
              <CheckCircleIcon className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Mitra: {legal.mitraAfiliasi}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Kantor & Layanan Donatur */}
      <div className="space-y-3.5 pt-4 border-t border-slate-200">
        <h3 className="font-medium text-slate-950 text-base">
          Sekretariat &amp; Kontak
        </h3>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-2.5">
            <MapPointIcon className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{contacts.address}</span>
          </div>

          {contacts.phone && (
            <a
              href={buildTelUrl(contacts.phone)}
              className="group flex items-center gap-2.5 hover:text-emerald-800 transition-colors"
              aria-label={`Telepon kantor: ${contacts.phone}`}
            >
              <PhoneIcon className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="group-hover:underline underline-offset-2">{contacts.phone}</span>
            </a>
          )}

          {contacts.email && (
            <a
              href={`mailto:${contacts.email}`}
              className="group flex items-center gap-2.5 hover:text-emerald-800 transition-colors"
              aria-label={`Email: ${contacts.email}`}
            >
              <LetterIcon className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="group-hover:underline underline-offset-2">{contacts.email}</span>
            </a>
          )}

          <div className="flex items-center gap-2.5">
            <ClockCircleIcon className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{contacts.officeHours}</span>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <WhatsAppIcon className="w-4.5 h-4.5 shrink-0" />
              <span>Hubungi Layanan Utama</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
