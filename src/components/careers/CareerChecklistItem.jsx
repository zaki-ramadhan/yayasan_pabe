import { CheckIcon as Check } from "@solar-icons/react/line-duotone/check";

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
      <span className="mt-0.5 flex items-center justify-center w-4.5 h-4.5 rounded bg-emerald-50 text-emerald-600 shrink-0">
        <Check className="w-3 h-3" aria-hidden="true" />
      </span>
      <span className="text-sm font-normal text-slate-700 leading-relaxed">
        {text}
      </span>
    </li>
  );
}
