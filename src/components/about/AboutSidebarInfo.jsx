import { CheckCircle2, Phone, Mail, Clock, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { ORG_PROFILE } from "@/data/orgProfile";

export function AboutSidebarInfo() {
  const whatsappUrl = `https://wa.me/${ORG_PROFILE.contacts.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Assalamu'alaikum Yayasan PABE, mohon info program yayasan.")}`;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-300 space-y-4 shadow-2xs">
      {/* 1. Legalitas & Akreditasi */}
      <div className="space-y-3.5">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-slate-950 text-base">
            Legalitas &amp; Sertifikasi
          </h3>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <div>
            <span className="text-xs sm:text-sm font-medium text-primary block">
              SK Kemenkumham RI
            </span>
            <p className="font-medium text-slate-900 mt-0.5">
              {ORG_PROFILE.legal.skKemenkumham}
            </p>
          </div>

          <div>
            <span className="text-xs sm:text-sm font-medium text-primary block">
              Izin Operasional LKS
            </span>
            <p className="font-medium text-slate-900 mt-0.5">
              {ORG_PROFILE.legal.izinIzinSosial}
            </p>
          </div>

          <div>
            <span className="text-xs sm:text-sm font-medium text-primary block">
              Nomor Pokok Wajib Pajak (NPWP)
            </span>
            <p className="font-medium text-slate-900 mt-0.5 font-mono">
              {ORG_PROFILE.legal.npwp}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <span className="text-xs sm:text-sm font-medium text-primary block">
              Kepatuhan &amp; Akuntabilitas
            </span>
            <div className="flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Audit KAP: Opini Wajar Tanpa Pengecualian (WTP)</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 text-xs sm:text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kepatuhan Syariah Dewan Pengawas</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Kantor & Layanan Donatur */}
      <div className="space-y-3.5 pt-4 border-t border-slate-200">
        <h3 className="font-semibold text-slate-950 text-base">
          Kantor &amp; Layanan Donatur
        </h3>

        <div className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{ORG_PROFILE.contacts.address}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{ORG_PROFILE.contacts.phone}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{ORG_PROFILE.contacts.email}</span>
          </div>

          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-slate-500 shrink-0" />
            <span>{ORG_PROFILE.contacts.officeHours}</span>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-medium transition-colors shadow-2xs cursor-pointer"
            >
              <WhatsAppIcon className="w-4.5 h-4.5 shrink-0" />
              <span>Hubungi Layanan WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
