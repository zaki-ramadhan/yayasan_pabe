import { Calendar } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { SafeImage } from "@/components/ui/SafeImage";

/**
 * Individual campaign progress update item with photos and disbursed amounts
 * @param {object} update - Update item details
 */
export function CampaignUpdateItem({ update }) {
  let photos = [];
  if (Array.isArray(update.images)) {
    photos = update.images.filter(Boolean);
  } else if (typeof update.images === "string" && update.images.trim()) {
    try {
      const parsed = JSON.parse(update.images);
      photos = Array.isArray(parsed) ? parsed.filter(Boolean) : [update.images];
    } catch {
      photos = [update.images];
    }
  } else if (update.image) {
    photos = [update.image];
  }

  return (
    <div className="py-5 first:pt-0 last:pb-0 space-y-2.5">
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 flex-wrap gap-2">
        <span className="flex items-center gap-1.5 text-slate-500">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{formatDate(update.date)}</span>
        </span>
        {update.disbursedAmount ? (
          <span className="text-slate-600">
            Tersalurkan:{" "}
            <span className="font-semibold text-emerald-700">
              {formatRupiah(update.disbursedAmount)}
            </span>
          </span>
        ) : null}
      </div>

      <div className="space-y-1">
        <h4 className="font-semibold text-slate-950 text-base sm:text-lg leading-snug">
          {update.title}
        </h4>
        <p className="text-slate-800 text-sm sm:text-base leading-relaxed">
          {update.content}
        </p>
      </div>

      {/* Dokumentasi Foto Penyaluran */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-2.5 mt-2">
          {photos.map((imgUrl, idx) => (
            <a
              key={idx}
              href={imgUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Lihat foto dokumentasi"
              className={`block relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 hover:opacity-90 transition-opacity ${
                photos.length === 1 ? "col-span-2 sm:col-span-1" : ""
              }`}
            >
              <SafeImage
                src={imgUrl}
                alt={`Dokumentasi ${update.title} ${idx + 1}`}
                sizes="(max-width: 640px) 50vw, 380px"
                fallbackText="Dokumentasi"
              />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
