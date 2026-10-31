import { CareerApplyButton } from "./CareerApplyButton";
import { formatDeadlineDate } from "@/lib/formatters";

/**
 * Molecule component: Bottom application call-to-action banner inside the detail panel
 * @param {object} props
 * @param {string} [props.applyUrl]
 * @param {string} props.deadline
 */
export function CareerDetailCta({ applyUrl, deadline, onApply }) {
  const formattedDeadline = deadline ? formatDeadlineDate(deadline) : "";
  const hasDeadline = formattedDeadline && formattedDeadline !== "-";

  return (
    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div>
        <h3 className="text-base font-medium text-slate-900">
          Tertarik dengan posisi ini?
        </h3>
        <p className="text-sm font-normal text-slate-600 mt-0.5">
          {hasDeadline
            ? `Kirimkan lamaran Anda sebelum ${formattedDeadline}.`
            : "Pendaftaran dibuka hingga posisi terisi. Kirimkan lamaran Anda sekarang."}
        </p>
      </div>
      <CareerApplyButton
        url={applyUrl}
        label="Lamar Sekarang"
        onClick={onApply}
        fullWidthMobile
      />
    </div>
  );
}

