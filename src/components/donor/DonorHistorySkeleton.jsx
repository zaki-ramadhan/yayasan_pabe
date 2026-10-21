import { DonorSummaryCardsSkeleton } from "@/components/donor/DonorSummaryCards";
import { DonorTransactionTableSkeleton } from "@/components/donor/DonorTransactionTable";

export function DonorHistorySkeleton() {
  return (
    <div className="space-y-2.5">
      {/* 3 Metric Cards Strip */}
      <DonorSummaryCardsSkeleton />

      {/* Transaction Table Skeleton */}
      <DonorTransactionTableSkeleton />
    </div>
  );
}
