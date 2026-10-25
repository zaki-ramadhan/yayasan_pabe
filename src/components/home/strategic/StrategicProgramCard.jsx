/**
 * StrategicProgramCard
 * Sub-komponen modular untuk satu kartu rencana strategis jangka panjang.
 *
 * Aturan Disiplin:
 * - Minimal ukuran teks: text-sm (tidak ada text-xs)
 * - Maksimal font weight: font-medium (tidak ada font-semibold / font-bold)
 *
 * @param {object} props
 * @param {{ id: string, number: string, title: string, desc: string, target: string }} props.item
 */
export function StrategicProgramCard({ item }) {
  if (!item) return null;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4">
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500 font-mono tracking-wider">
            {item.number}
          </span>
          <span className="px-2.5 py-0.5 rounded-md text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
            {item.target}
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-medium text-slate-950 leading-snug">
          {item.title}
        </h3>
        <p className="text-sm sm:text-base font-normal text-slate-700 leading-relaxed">
          {item.desc}
        </p>
      </div>
    </div>
  );
}
