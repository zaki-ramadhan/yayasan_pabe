import Image from "next/image";

export function BeneficiaryStatsBar({ stats }) {
  const {
    total = 132,
    yatimCount = 98,
    lansiaDhuafaCount = 34,
  } = stats || {};

  const statCards = [
    {
      label: "Total Penerima Manfaat",
      value: `${total} Orang`,
    },
    {
      label: "Anak Yatim Piatu",
      value: `${yatimCount} Anak`,
    },
    {
      label: "Lansia & Dhu'afa",
      value: `${lansiaDhuafaCount} Orang`,
    },
    {
      label: "Validasi Legalitas LKS",
      value: "100% Terdata",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
      {statCards.map((card, idx) => (
        <div
          key={idx}
          className="relative w-full aspect-[363/224]"
        >
          {/* Background Folder Frame - Putih Polos */}
          <Image
            src="/img/frames/folder-admin.svg"
            alt=""
            aria-hidden="true"
            draggable={false}
            fill
            priority={idx < 2}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-fill pointer-events-none select-none"
          />

          {/* Konten Metrik di Dalam Folder (2 Baris Tanpa Icon & Tanpa Baris ke-3) */}
          <div className="relative z-10 h-full flex flex-col justify-end pb-3.5 sm:pb-4 md:pb-4.5 px-3.5 sm:px-4 md:px-5 space-y-1">
            <span className="text-xs sm:text-sm font-medium text-slate-600 block leading-tight truncate">
              {card.label}
            </span>
            <div className="text-lg sm:text-2xl font-semibold text-slate-900 tracking-tight truncate">
              {card.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
