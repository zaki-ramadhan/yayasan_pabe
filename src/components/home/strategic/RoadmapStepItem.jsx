/**
 * RoadmapStepItem
 * Sub-komponen modular untuk satu program pada layout timeline bertingkat.
 *
 * Aturan Disiplin:
 * - Minimal ukuran teks: text-sm (tidak ada text-xs)
 * - Maksimal font weight: font-medium (tidak ada font-semibold / font-bold)
 * - Tanpa badge "Tahap" / "Step" (sesuai instruksi pengguna).
 *
 * @param {object} props
 * @param {string} props.title - Judul program
 * @param {string} props.desc - Uraian program
 * @param {string} [props.staggerClass] - Kelas utility penentu ketinggian bertingkat di breakpoint desktop
 * @param {boolean} [props.isLast] - Penanda batas kolom terakhir (tanpa garis pembatas kanan)
 * @param {boolean} [props.isFirst] - Penanda batas kolom pertama (tanpa padding kiri desktop)
 */
export function RoadmapStepItem({
  title,
  desc,
  staggerClass = "",
  isLast = false,
  isFirst = false,
}) {
  return (
    <div
      className={`flex flex-col justify-start transition-all duration-200 ${staggerClass} ${
        !isLast ? "lg:border-r lg:border-slate-200/90 lg:pr-6 xl:pr-8" : ""
      } ${
        !isFirst ? "lg:pl-6 xl:pl-8" : ""
      } border-l-2 border-slate-200 pl-4 py-2 lg:border-l-0 lg:py-0`}
    >
      <h3 className="text-base sm:text-lg font-medium text-slate-950 leading-snug mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base font-normal text-slate-600 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
