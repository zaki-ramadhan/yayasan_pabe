/**
 * Atomic component: Single list item untuk detail lowongan pekerjaan
 * Menggunakan tanda hubung strip '-' sesuai preferensi antarmuka pengguna
 * @param {object} props
 * @param {string} props.text
 */
export function CareerChecklistItem({ text }) {
  if (!text) return null;

  return (
    <li className="flex items-start gap-2 text-sm font-normal text-slate-700 leading-relaxed">
      <span
        className="text-slate-500 font-medium shrink-0 select-none leading-relaxed"
        aria-hidden="true"
      >
        -
      </span>
      <span>{text}</span>
    </li>
  );
}
