"use client";

import { useMemo } from "react";
import { PaymentChannelItem } from "@/components/donation/PaymentChannelItem";
import { PAYMENT_CATEGORIES } from "@/data/paymentChannels";
import { cn } from "@/lib/utils";

/**
 * Open categorized list of payment channels (accessible without dropdowns).
 *
 * @param {object} props
 * @param {Array} props.channels - Array of payment channel objects
 * @param {string} props.selectedChannelId - Selected channel ID
 * @param {Function} props.onSelectChannel - Selection handler
 * @param {boolean} [props.compact] - Compact rendering mode
 */
export function PaymentCategoryGroupList({
  channels = [],
  selectedChannelId,
  onSelectChannel,
  compact = false,
}) {
  const groupedChannels = useMemo(() => {
    const map = {};
    channels.forEach((channel) => {
      const cat = channel.category || "va";
      if (!map[cat]) map[cat] = [];
      map[cat].push(channel);
    });
    return map;
  }, [channels]);

  return (
    <div className={cn("space-y-4", compact && "space-y-3.5")}>
      {PAYMENT_CATEGORIES.map((cat) => {
        const catChannels = groupedChannels[cat.id] || [];
        if (catChannels.length === 0) return null;

        return (
          <div key={cat.id} className="space-y-2">
            <div className="flex items-center justify-between px-0.5">
              <span className={cn("font-medium text-slate-700", compact ? "text-xs" : "text-sm")}>
                {cat.name}
              </span>
            </div>

            <div className={cn("space-y-2", compact && "space-y-1.5")}>
              {catChannels.map((channel) => (
                <PaymentChannelItem
                  key={channel.id}
                  channel={channel}
                  isSelected={selectedChannelId === channel.id}
                  onSelect={() => onSelectChannel(channel.id)}
                  compact={compact}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
