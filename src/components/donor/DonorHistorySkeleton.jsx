import { Skeleton } from "@/components/ui/Skeleton";
import { DonorSummaryCardsSkeleton } from "@/components/donor/DonorSummaryCards";
import { DonorTransactionTableSkeleton } from "@/components/donor/DonorTransactionTable";

export function DonorHistorySkeleton({ typeFilter = "ALL" }) {
  return (
    <div className="space-y-2.5">
      <Skeleton className="h-[42px] w-80 sm:w-[440px] rounded-lg" />

      <DonorSummaryCardsSkeleton />

      <DonorTransactionTableSkeleton typeFilter={typeFilter} />
    </div>
  );
}
