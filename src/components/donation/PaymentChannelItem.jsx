import { RadioIndicator } from "@/components/ui/RadioIndicator";
import { PaymentChannelLogo } from "@/components/donation/PaymentChannelLogo";
import { cn } from "@/lib/utils";

/**
 * Individual payment channel selectable item (e.g. QRIS, BRI VA, Mandiri VA)
 *
 * @param {object} props
 * @param {object} props.channel - Channel object containing id, name, type, logo
 * @param {boolean} props.isSelected - Whether this channel is currently selected
 * @param {() => void} props.onSelect - Selection callback
 * @param {string} [props.className] - Optional custom class
 * @param {boolean} [props.compact] - Compact rendering mode
 */
export function PaymentChannelItem({
  channel,
  isSelected,
  onSelect,
  className = "",
  compact = false,
}) {
  return (
    <label
      onClick={onSelect}
      className={cn(
        "flex items-center rounded-lg border transition-all cursor-pointer",
        compact ? "py-2.5 px-2.5 sm:p-2.5 min-h-[46px]" : "py-3.5 px-3 sm:py-3 sm:px-3 min-h-[52px] sm:min-h-[48px]",
        isSelected
          ? "bg-primary/5 border-primary shadow-xs"
          : "bg-white border-slate-300 hover:bg-slate-50",
        className
      )}
    >
      <div className={cn("flex items-center flex-1 min-w-0", compact ? "gap-2" : "gap-2.5 sm:gap-3")}>
        <RadioIndicator
          isSelected={isSelected}
          size="sm"
          className={compact ? "mr-1 sm:mr-1.5" : "mr-1.5 sm:mr-2"}
        />
        {channel.logo && (
          <PaymentChannelLogo
            logo={channel.logo}
            name={channel.name}
            type={channel.type}
            compact={compact}
          />
        )}
        <div className="min-w-0 flex-1">
          <span className="font-medium text-slate-900 block truncate text-sm">
            {channel.name}
          </span>
        </div>
      </div>
    </label>
  );
}

