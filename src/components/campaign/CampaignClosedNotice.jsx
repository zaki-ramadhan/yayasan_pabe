import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getCampaignDetailHref, isZisCampaign } from "@/lib/zisFilter";

/**
 * Notice banner displayed when a campaign is finished / no longer accepting donations.
 * @param {{ slug: string, title: string }} campaign
 */
export function CampaignClosedNotice({ campaign }) {
  const isZis = isZisCampaign(campaign);
  const catalogHref = isZis ? "/zis" : "/program";

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-xs space-y-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 text-slate-600 mb-1">
          <CheckCircle2 className="w-6 h-6 text-slate-700" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-950">
          Penggalangan Dana Telah Ditutup
        </h1>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md mx-auto">
          Program donasi <strong className="text-slate-900 font-semibold">{campaign.title}</strong> telah resmi berakhir dan tidak menerima donasi baru. Terima kasih atas kepedulian seluruh donatur.
        </p>
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={getCampaignDetailHref(campaign)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium text-sm transition-colors text-center"
          >
            Lihat Detail &amp; Penyaluran
          </Link>
          <Link
            href={catalogHref}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors text-center"
          >
            Lihat Program Aktif Lainnya
          </Link>
        </div>
      </div>
    </main>
  );
}
