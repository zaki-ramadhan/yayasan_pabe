import Image from "next/image";
import { ORG_PROFILE } from "@/data/orgProfile";
import { RoadmapStepItem } from "./strategic/RoadmapStepItem";
import { StrategicGoalBanner } from "./strategic/StrategicGoalBanner";

const SHORT_TERM_STAGGERS = [
  "lg:pt-28", // Posisi 1
  "lg:pt-20", // Posisi 2
  "lg:pt-14", // Posisi 3
  "lg:pt-7",  // Posisi 4
  "lg:pt-0",  // Posisi 5 (tertinggi)
];

const LONG_TERM_STAGGERS = [
  "lg:pt-0",  // Posisi 1 (tertinggi di kiri)
  "lg:pt-10", // Posisi 2 (menurun bertahap)
  "lg:pt-20", // Posisi 3 (menurun lebih lanjut)
  "lg:pt-28", // Posisi 4 (terendah di kanan)
];

/**
 * HomeStrategicRoadmap
 * Koordinator tata letak untuk Program Kerja Jangka Pendek dan Jangka Panjang di Beranda.
 * Mengadopsi tata letak timeline bertingkat sesuai referensi uiblockify:
 * - Jangka Pendek: Heading kiri, tangga poin menaik (stagger ascending).
 * - Jangka Panjang: Mirrored (heading kanan, tangga poin menurun / stagger descending).
 * - Tanpa badge / teks biru di atas heading.
 * - Tanpa badge "tahap" pada masing-masing item.
 * - Minimal font: text-sm, maksimal font weight: font-medium.
 */
export function HomeStrategicRoadmap() {
  const shortTermPrograms = ORG_PROFILE.shortTermRoadmap || [];
  const longTermPrograms = ORG_PROFILE.longTermRoadmap || [];
  const goalText = ORG_PROFILE.longTermGoalText;

  return (
    <section className="relative bg-white border-y border-slate-200/90 py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Texture Overlay Decoration - Kanan Atas */}
      <div className="absolute top-0 right-0 w-1/2 aspect-square pointer-events-none select-none mix-blend-multiply opacity-20 z-0 overflow-hidden">
        <Image
          src="/img/textures/texture-overlay-5.webp"
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 40vw"
          className="object-cover object-top-right pointer-events-none select-none"
          draggable={false}
          aria-hidden="true"
        />
      </div>

      {/* Texture Overlay Decoration - Kiri Bawah (Rotate 180 Terbalik) */}
      <div className="absolute bottom-0 left-0 w-1/2 aspect-square pointer-events-none select-none mix-blend-multiply opacity-20 rotate-180 z-0 overflow-hidden">
        <Image
          src="/img/textures/texture-overlay-5.webp"
          alt=""
          fill
          sizes="(max-width: 1024px) 50vw, 40vw"
          className="object-cover object-top-right pointer-events-none select-none"
          draggable={false}
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 1. Program Kerja Jangka Pendek (Hal 8 Proposal) */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-end pb-4 border-b border-slate-100">
            <div className="lg:col-span-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-slate-950 tracking-tight leading-tight">
                Program Kerja Jangka Pendek
              </h2>
            </div>
            <div className="lg:col-span-6">
              <p className="text-sm sm:text-base font-normal text-slate-600 leading-relaxed">
                Rangkaian program operasional rutin dan aksi kepedulian berkala untuk memenuhi kebutuhan mendasar anak-anak yatim-piatu dan dhu’afa.
              </p>
            </div>
          </div>

          {/* Grid 5 Kolom Jangka Pendek (Tangga Menaik) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 lg:gap-0">
            {shortTermPrograms.map((item, idx) => (
              <RoadmapStepItem
                key={item.id}
                title={item.title}
                desc={item.desc}
                staggerClass={SHORT_TERM_STAGGERS[idx] || "lg:pt-0"}
                isFirst={idx === 0}
                isLast={idx === shortTermPrograms.length - 1}
              />
            ))}
          </div>
        </div>

        {/* 2. Program Kerja Jangka Panjang (Hal 9 Proposal - Mirrored) */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-end pb-4 border-b border-slate-100">
            <div className="lg:col-span-6 lg:order-2 lg:text-right">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-slate-950 tracking-tight leading-tight">
                Program Kerja Jangka Panjang
              </h2>
            </div>
            <div className="lg:col-span-6 lg:order-1 lg:text-right">
              <p className="text-sm sm:text-base font-normal text-slate-600 leading-relaxed">
                Rencana strategis pembangunan sarana terpadu dan program kemandirian umat untuk mewujudkan tatanan masyarakat yang berdaya, berpendidikan, dan sejahtera lahir batin.
              </p>
            </div>
          </div>

          {/* Grid 4 Kolom Jangka Panjang */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0">
            {longTermPrograms.map((item, idx) => (
              <RoadmapStepItem
                key={item.id}
                title={item.title}
                desc={item.desc}
                staggerClass={LONG_TERM_STAGGERS[idx] || "lg:pt-0"}
                isFirst={idx === 0}
                isLast={idx === longTermPrograms.length - 1}
              />
            ))}
          </div>

          {/* Narasi Penutup Resmi Proposal */}
          <StrategicGoalBanner text={goalText} />
        </div>
      </div>
    </section>
  );
}
