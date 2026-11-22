import { LoaderIcon as Loader2 } from "@solar-icons/react/linear/loader";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah, formatDate, formatPaymentChannel } from "@/lib/formatters";

export function AdminDonorDonationHistory({
  donations = [],
  isLoading = false,
  hasMore = false,
  isFetchingMore = false,
  sentinelRef,
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
        <h5 className="text-xs font-medium text-slate-700">
          Riwayat donasi
        </h5>
        {donations.length > 0 && (
          <span className="text-xs text-slate-500">
            {donations.length} donasi dimuat
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="divide-y divide-slate-100 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="py-3.5 flex items-center justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <Skeleton className="h-3.5 w-28 rounded" />
                <Skeleton className="h-3 w-48 rounded" />
                <Skeleton className="h-2.5 w-24 rounded" />
              </div>
              <div className="space-y-1.5 text-right shrink-0">
                <Skeleton className="h-4 w-20 rounded ml-auto" />
                <Skeleton className="h-3 w-16 rounded ml-auto" />
              </div>
            </div>
          ))}
        </div>
      ) : donations.length > 0 ? (
        <div className="divide-y divide-slate-100">
          {donations.map((d) => (
            <div
              key={d.id}
              className="py-3.5 flex items-center justify-between gap-3 text-sm hover:bg-slate-50/50 transition-colors"
            >
              <div className="min-w-0 space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900 text-xs block truncate select-all">
                    {d.invoiceId}
                  </span>
                </div>
                <p className="text-xs text-slate-600 truncate">
                  {d.campaignTitle}
                </p>
                <span className="text-xs text-slate-500 block font-normal">
                  {formatDate(d.paidAt || d.createdAt)}
                </span>
              </div>

              <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                <span className="font-medium text-slate-900 text-sm block tabular-nums">
                  {formatRupiah(d.totalAmount)}
                </span>
                <Badge variant="secondary" className="max-w-[140px]">
                  {formatPaymentChannel(d.paymentChannel)}
                </Badge>
              </div>
            </div>
          ))}

          {hasMore && (
            <div
              ref={sentinelRef}
              className="py-3 text-center text-xs text-slate-500 flex items-center justify-center gap-2"
            >
              {isFetchingMore ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span>Memuat donasi lebih lama...</span>
                </>
              ) : (
                <span className="text-slate-500">
                  Gulir ke bawah untuk memuat riwayat lainnya
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-slate-500">
          Belum ada transaksi donasi.
        </div>
      )}
    </div>
  );
}

