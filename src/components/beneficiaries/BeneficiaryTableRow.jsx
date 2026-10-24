import { CheckCircle2, MapPin } from "lucide-react";
import { BENEFICIARY_CATEGORIES } from "@/data/beneficiaries";

export function BeneficiaryTableRow({ item, index }) {
  const isYatim = item.category === BENEFICIARY_CATEGORIES.YATIM;

  // Inisial untuk avatar visual
  const initials = item.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <tr className="hover:bg-slate-50/70 transition-colors border-b border-slate-200/80 last:border-0">
      {/* Kolom ID */}
      <td className="px-3.5 py-3 text-xs font-mono font-medium text-slate-700 whitespace-nowrap">
        {item.id}
      </td>

      {/* Kolom Nama */}
      <td className="px-3.5 py-3 whitespace-nowrap">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 ${
              isYatim
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-sky-50 text-sky-800 border-sky-200"
            }`}
          >
            {initials}
          </div>
          <div className="font-medium text-slate-900 text-xs sm:text-sm">
            {item.name}
          </div>
        </div>
      </td>

      {/* Kolom Kategori */}
      <td className="px-3.5 py-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${
            isYatim
              ? "bg-emerald-50 text-emerald-800 border-emerald-200/80"
              : "bg-sky-50 text-sky-800 border-sky-200/80"
          }`}
        >
          {item.categoryLabel}
        </span>
      </td>

      {/* Kolom Gender */}
      <td className="px-3.5 py-3 whitespace-nowrap text-xs text-slate-700">
        <span
          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            item.gender === "L"
              ? "bg-slate-100 text-slate-800"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {item.gender === "L" ? "Laki-laki" : "Perempuan"}
        </span>
      </td>

      {/* Kolom Program */}
      <td className="px-3.5 py-3 whitespace-nowrap text-xs text-slate-800 font-medium">
        {item.program}
      </td>

      {/* Kolom Wilayah */}
      <td className="px-3.5 py-3 whitespace-nowrap text-xs text-slate-700">
        <span className="inline-flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-700 shrink-0" />
          {item.location}
        </span>
      </td>

      {/* Kolom Status Verifikasi */}
      <td className="px-3.5 py-3 whitespace-nowrap text-right">
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Aktif
        </span>
      </td>
    </tr>
  );
}
