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
 * @param {React.ComponentType} [props.icon] - Ikon Solar Icons
 * @param {string} [props.staggerClass] - Kelas utility penentu ketinggian bertingkat di breakpoint desktop
 * @param {boolean} [props.isLast] - Penanda batas kolom terakhir (tanpa garis pembatas kanan)
 * @param {boolean} [props.isFirst] - Penanda batas kolom pertama (tanpa padding kiri desktop)
 */
export function RoadmapStepItem({
  title,
  desc,
  icon: Icon,
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
      {Icon && (
        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-800 mb-3.5 shrink-0 shadow-2xs">
          <Icon className="w-6 h-6 text-slate-800" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-medium text-slate-950 leading-snug mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base font-normal text-slate-600 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
