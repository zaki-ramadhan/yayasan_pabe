import { Calendar, MapPin, Users } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { SafeImage } from "@/components/ui/SafeImage";

/**
 * Distribution record card displaying completed aid distributions
 * Clean editorial design without badge chips or colorful icons.
 * @param {object} props
 * @param {object} props.record
 */
export function DistributionRecordCard({ record }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs transition-colors flex flex-col justify-between">
      <div>
        <div className="relative aspect-16/9 w-full bg-slate-100 overflow-hidden border-b border-slate-200">
          <SafeImage
            src={record.image}
            alt={record.title}
            fallbackText="Dokumentasi Distribusi"
          />
        </div>

        <div className="p-5 space-y-3.5">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-sm text-slate-600 font-normal">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                {formatDate(record.date)}
              </span>
              <span>{record.id}</span>
            </div>

            <h3 className="text-base sm:text-lg font-medium text-slate-900 leading-snug line-clamp-2">
              {record.title}
            </h3>
          </div>

          <div className="space-y-2 text-sm text-slate-700 border-t border-slate-100 pt-3">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>{record.location}</span>
            </div>
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <span>Penerima: {record.beneficiaries}</span>
            </div>
          </div>

          {record.notes && (
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
              {record.notes}
            </p>
          )}
        </div>
      </div>

      <div className="px-5 pb-5 pt-3 flex items-center justify-between border-t border-slate-100 text-sm text-slate-700">
        <span>Penanggung Jawab: <strong className="text-slate-900 font-medium">{record.pj}</strong></span>
        <span className="font-medium text-slate-950 text-base">{formatRupiah(record.value)}</span>
      </div>
    </div>
  );
}
