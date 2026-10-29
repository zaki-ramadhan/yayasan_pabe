import Image from "next/image";
import { formatCompactRupiah, formatRupiah, formatNumber } from "@/lib/formatters";

export function AdminMetricCards({ stats }) {
  const totalCollected = stats?.totalCollected || 0;
  const totalDisbursed = stats?.totalDisbursed || 0;
  const activeDonors = stats?.activeDonors || 0;
  const activeCampaigns = stats?.activeCampaigns || 0;

  const cards = [
    {
      label: "Total Donasi Terhimpun",
      value: formatCompactRupiah(totalCollected),
      detailValue: formatRupiah(totalCollected),
      fullValue: formatRupiah(totalCollected),
      radialColor: "#10B981", // Emerald (Kas Masuk)
    },
    {
      label: "Dana Telah Disalurkan",
      value: formatCompactRupiah(totalDisbursed),
      detailValue: formatRupiah(totalDisbursed),
      fullValue: formatRupiah(totalDisbursed),
      radialColor: "#0284C7", // Sky/Blue (Penyaluran)
    },
    {
      label: "Donatur Terdaftar",
      value: `${formatNumber(activeDonors)} Orang`,
      fullValue: `${formatNumber(activeDonors)} Orang`,
      radialColor: "#D97706", // Warm Amber (Komunitas Donatur)
    },
    {
      label: "Program Donasi Aktif",
      value: `${formatNumber(activeCampaigns)} Program`,
      fullValue: `${formatNumber(activeCampaigns)} Program`,
      radialColor: "#E11D48", // Rose (Program Aktif)
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="relative w-full aspect-[363/224]"
        >
          {/* Background Folder Frame */}
          <Image
            src="/img/frames/folder-admin.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-fill pointer-events-none select-none"
          />

          {/* Radial Gradient Overlay */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none select-none opacity-7"
            style={{
              background: `radial-gradient(ellipse at 100% 100%, ${card.radialColor} 0%, transparent 72%)`,
              WebkitMaskImage: 'url("/img/frames/folder-admin.svg?v=3")',
              maskImage: 'url("/img/frames/folder-admin.svg?v=3")',
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />

          {/* Dekorasi Garis Lingkaran Tanpa Fill (Border Putih Nampak) */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none select-none overflow-hidden"
            style={{
              WebkitMaskImage: 'url("/img/frames/folder-admin.svg?v=3")',
              maskImage: 'url("/img/frames/folder-admin.svg?v=3")',
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          >
            <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-[18px] border-white bg-transparent opacity-60" />
          </div>

          {/* Konten Metrik di Dalam Folder */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-3 sm:pb-3.5 md:pb-4 px-3.5 sm:px-4 md:px-4.5 space-y-0.5">
            <span className="text-sm font-medium text-slate-600 block leading-tight truncate">
              {card.label}
            </span>
            <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight truncate">
              {card.value}
            </div>
            {card.detailValue && (
              <p className="text-sm text-slate-500 font-normal leading-tight truncate mt-0.5 tabular-nums">
                {card.detailValue}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
