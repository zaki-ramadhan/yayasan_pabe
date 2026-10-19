import { CareerApplyButton } from "./CareerApplyButton";

/**
 * Molecule component: Bottom application call-to-action banner inside the detail panel
 * @param {object} props
 * @param {string} [props.applyUrl]
 * @param {string} props.deadline
 */
export function CareerDetailCta({ applyUrl, deadline, onApply }) {
  return (
    <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div>
        <h3 className="text-base font-medium text-slate-900">
          Tertarik dengan posisi ini?
        </h3>
        <p className="text-sm font-normal text-slate-600 mt-0.5">
          Kirimkan data profil Anda sebelum {deadline}.
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

