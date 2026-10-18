"use client";

import { useEffect, useCallback } from "react";
import { startCampaignDetailTour } from "@/components/campaign/campaignDetailTour";

const TOUR_KEY = "pabe_tour_campaign_seen";
const AUTOSTART_DELAY_MS = 900;

/**
 * Manages campaign detail page tour lifecycle.
 * - Auto-starts once globally (one localStorage key for all campaign pages)
 * - Exposes startTour() for manual trigger button
 *
 * @param {{ slug: string, hasDonations: boolean }} options
 * @returns {{ startTour: () => void }}
 */
export function useCampaignDetailTour({ slug, hasDonations }) {

  const startTour = useCallback(() => {
    startCampaignDetailTour(hasDonations);
  }, [hasDonations]);

  useEffect(() => {
    if (localStorage.getItem(TOUR_KEY)) return;

    const timer = setTimeout(() => {
      localStorage.setItem(TOUR_KEY, "1");
      startCampaignDetailTour(hasDonations);
    }, AUTOSTART_DELAY_MS);

    return () => clearTimeout(timer);
  }, [hasDonations]);

  return { startTour };
}
