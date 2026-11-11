import { Skeleton } from "@/components/ui/Skeleton";
import { DonorSummaryCardsSkeleton } from "@/components/donor/DonorSummaryCards";
import { DonorTransactionTableSkeleton } from "@/components/donor/DonorTransactionTable";

export function DonorHistorySkeleton() {
  return (
    <div className="space-y-2.5">
      {/* Segmented Tabs Skeleton */}
      <Skeleton className="h-[42px] w-80 sm:w-[440px] rounded-lg" />

      {/* 3 Metric Cards Strip */}
      <DonorSummaryCardsSkeleton />

      {/* Transaction Table Skeleton */}
      <DonorTransactionTableSkeleton />
    </div>
  );
}
