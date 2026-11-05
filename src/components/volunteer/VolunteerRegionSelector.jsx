"use client";

import { RegionSelector } from "@/components/shared/RegionSelector";

/**
 * Sub-widget pemilih wilayah domisili untuk formulir relawan.
 * Terhubung langsung ke modul terpusat RegionSelector dengan status required=true.
 */
export function VolunteerRegionSelector(props) {
  return <RegionSelector required {...props} />;
}

export default VolunteerRegionSelector;
