"use client";

import { HelpCircle } from "lucide-react";
import { useCampaignDetailTour } from "@/hooks/useCampaignDetailTour";

/**
 * Icon-only tour trigger button, placed alongside the main donate CTA.
 * @param {{ slug: string, hasDonations: boolean }} props
 */
export function SidebarTourButton({ slug, hasDonations }) {
  const { startTour } = useCampaignDetailTour({ slug, hasDonations });

  return (
    <button
      type="button"
      onClick={startTour}
      aria-label="Panduan halaman program"
      className="inline-flex items-center justify-center h-10.5 w-10.5 shrink-0 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors cursor-pointer shadow-xs"
    >
      <HelpCircle className="w-4.5 h-4.5" />
    </button>
  );
}
