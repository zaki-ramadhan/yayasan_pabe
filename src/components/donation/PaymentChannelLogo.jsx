import { SafeImage } from "@/components/ui/SafeImage";
import { cn } from "@/lib/utils";

/**
 * Payment channel logo badge component with responsive sizing and graceful fallback.
 *
 * @param {object} props
 * @param {string} props.logo - Path to logo asset
 * @param {string} props.name - Channel name for alt text
 * @param {string} [props.type] - Fallback channel type (e.g. 'VA' | 'QRIS')
 * @param {boolean} [props.compact] - Compact mode for routine donation picker
 * @param {string} [props.className] - Additional class name
 */
export function PaymentChannelLogo({
  logo,
  name,
  type = "PAY",
  compact = false,
  className = "",
}) {
  return (
    <div
      className={cn(
        "relative shrink-0 flex items-center justify-center select-none",
        compact ? "w-9 h-5 sm:w-10 sm:h-5.5" : "w-12 h-6 sm:w-14 sm:h-7",
        className
      )}
    >
      {logo ? (
        <SafeImage
          src={logo}
          alt={name || "Saluran donasi"}
          fill
          className="object-contain"
          sizes="80px"
          fallbackText={type}
        />
      ) : (
        <span className="text-xs font-semibold text-slate-500 tracking-wider">
          {type}
        </span>
      )}
    </div>
  );
}
