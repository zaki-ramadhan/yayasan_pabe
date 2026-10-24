import { Users, Heart, GraduationCap, ShieldCheck } from "lucide-react";

export function BeneficiaryStatsBar({ stats }) {
  const {
    total = 132,
    yatimCount = 98,
    lansiaDhuafaCount = 34,
    verifiedStatus = "Terdaftar Resmi LKS Cakung 2026",
  } = stats || {};

  const statCards = [
    {
      label: "Total Jiwa Binaan",
      value: `${total} Jiwa`,
      desc: "Anak asuh & lansia terlindungi",
      icon: Users,
      colorClass: "text-slate-900 bg-slate-100 border-slate-200",
    },
    {
      label: "Anak Yatim Piatu",
      value: `${yatimCount} Anak`,
      desc: "Bimbel PABE Smart & TPA",
      icon: GraduationCap,
      colorClass: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      label: "Lansia & Dhu'afa",
      value: `${lansiaDhuafaCount} Jiwa`,
      desc: "Layanan akupresur & sembako",
      icon: Heart,
      colorClass: "text-sky-700 bg-sky-50 border-sky-200",
    },
    {
      label: "Validasi LKS",
      value: "100% Terdata",
      desc: verifiedStatus,
      icon: ShieldCheck,
      colorClass: "text-amber-700 bg-amber-50 border-amber-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-medium text-slate-700 line-clamp-1">
                {card.label}
              </span>
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border flex items-center justify-center shrink-0 ${card.colorClass}`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-lg sm:text-2xl font-bold text-slate-950 tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-700 mt-0.5 line-clamp-1">
                {card.desc}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
