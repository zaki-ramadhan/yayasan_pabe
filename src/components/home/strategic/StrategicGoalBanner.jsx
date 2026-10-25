/**
 * StrategicGoalBanner
 * Sub-komponen modular untuk menampilkan narasi tujuan jangka panjang resmi dari proposal.
 *
 * Aturan Disiplin:
 * - Minimal ukuran teks: text-sm (tidak ada text-xs)
 * - Maksimal font weight: font-medium (tidak ada font-semibold / font-bold)
 *
 * @param {object} props
 * @param {string} props.text - Narasi tujuan proposal
 */
export function StrategicGoalBanner({ text }) {
  if (!text) return null;

  return (
    <div className="p-4 sm:p-6 rounded-xl bg-slate-50 border border-slate-200/90">
      <p className="text-sm sm:text-base font-normal text-slate-700 leading-relaxed">
        {text}
      </p>
    </div>
  );
}
