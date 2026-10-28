"use client";

import { StorageCapacityBanner } from "./StorageCapacityBanner";
import { StorageFolderBreakdownCard } from "./StorageFolderBreakdownCard";

/**
 * Komponen orkestrator ringkasan kuota dan rincian berkas per folder Cloudflare R2.
 * Memisahkan tanggung jawab banner status kapasitas dari kartu rincian folder (SRP & Anti God-File).
 *
 * @param {object} props
 * @param {object} props.overview
 * @param {Function} [props.onRefresh]
 */
export function StorageStatsCard({ overview, onRefresh }) {
  return (
    <div className="space-y-5">
      <StorageCapacityBanner overview={overview} />
      <StorageFolderBreakdownCard
        folders={overview?.folders || []}
        isConfigured={overview?.isConfigured ?? true}
        onRefresh={onRefresh}
      />
    </div>
  );
}

export { StorageCapacityBanner, StorageFolderBreakdownCard };
