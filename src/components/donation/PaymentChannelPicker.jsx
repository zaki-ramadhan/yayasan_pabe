import { CheckoutStepHeader } from "@/components/donation/CheckoutStepHeader";
import { PaymentCategoryGroupList } from "@/components/donation/PaymentCategoryGroupList";
import { cn } from "@/lib/utils";

export function PaymentChannelPicker({
  channels = [],
  selectedChannelId,
  onSelectChannel,
  showHeader = true,
  stepNumber = 2,
  title = "Pilih saluran donasi",
  containerCard = true,
  className = "",
  compact = false,
}) {
  return (
    <div
      className={cn(
        containerCard && "bg-white p-5 sm:p-6 rounded-xl border border-slate-300 shadow-xs",
        compact ? "space-y-2" : "space-y-3 sm:space-y-4",
        className
      )}
    >
      {showHeader && (
        <CheckoutStepHeader
          step={stepNumber}
          title={title}
          titleSize={compact ? "text-sm font-semibold" : "text-base sm:text-lg"}
        />
      )}

      <PaymentCategoryGroupList
        channels={channels}
        selectedChannelId={selectedChannelId}
        onSelectChannel={onSelectChannel}
        compact={compact}
      />
    </div>
  );
}

