import { CheckCircleIcon } from "@solar-icons/react/bold/check-circle";

/**
 * Atomic component: Single checklist line item
 * Standard text-sm font-normal to save scroll.
 * @param {object} props
 * @param {string} props.text
 */
export function CareerChecklistItem({ text }) {
  if (!text) return null;

  return (
    <li className="flex items-start gap-2.5">
      <CheckCircleIcon
        className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <span className="text-sm font-normal text-slate-700 leading-relaxed">
        {text}
      </span>
    </li>
  );
}
