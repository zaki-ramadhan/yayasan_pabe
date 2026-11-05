/**
 * Step badge + title header for checkout form sections.
 * Reused across NominalPresetsPicker, PaymentChannelPicker, DonorIdentitySection.
 *
 * @param {object} props
 * @param {number|string} props.step - Step number displayed in the badge
 * @param {string} props.title - Section title text
 * @param {string} [props.titleSize] - Tailwind text-size class override for h2
 */
export function CheckoutStepHeader({ step, title, titleSize = "text-base sm:text-lg" }) {
  return (
    <div className="flex items-center gap-2.5">
      {step != null && step !== "" && (
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold shrink-0">
          {step}
        </span>
      )}
      <h2 className={`${titleSize} font-semibold text-slate-950`}>
        {title}
      </h2>
    </div>
  );
}
