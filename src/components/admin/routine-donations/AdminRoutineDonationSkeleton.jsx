import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

/**
 * Accurate Skeleton loader for Admin Routine Donation Page.
 * Matches 1:1 with AdminPageHeader, AdminRoutineDonationToolbar, Table, and TablePaginationFooter.
 */
export function AdminRoutineDonationSkeleton() {
  return (
    <div className="space-y-4">
      {/* 1. Page Header Skeleton (Matches AdminPageHeader) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-1">
        <div className="space-y-1">
          <Skeleton className="h-6 w-56 rounded-md" />
          <Skeleton className="h-4 w-80 max-w-full rounded" />
        </div>
      </div>

      {/* 2. Filter & Action Toolbar Skeleton (Matches AdminRoutineDonationToolbar) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Left Side: Search + 2 Select Filters */}
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <Skeleton className="h-10 flex-1 min-w-[200px] max-w-sm rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
        </div>

        {/* Right Side: Tes Cron CTA + Refresh Icon + Ekspor CSV */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Skeleton className="h-10 w-36 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
      </div>

      {/* 3. Main Table Container Skeleton */}
      <TableContainer>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-60 font-medium text-slate-600 text-sm py-2.5">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="font-medium text-slate-600 text-sm py-2.5 min-w-[280px] max-w-[360px]">
                  <Skeleton className="h-4 w-32 rounded" />
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                <TableHead className="w-40 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="w-36 font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                <TableHead className="w-28 text-center font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-14 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-24 text-right font-medium text-slate-600 text-sm py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-10 rounded ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {/* Donatur & Kontak dengan Avatar */}
                  <TableCell className="w-60 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="min-w-0 space-y-1">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-3.5 w-32 rounded" />
                      </div>
                    </div>
                  </TableCell>

                  {/* Program Kebaikan */}
                  <TableCell className="py-3 align-middle min-w-[280px] max-w-[360px]">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-48 max-w-full rounded" />
                      <Skeleton className="h-3 w-28 rounded" />
                    </div>
                  </TableCell>

                  {/* Komitmen Nominal */}
                  <TableCell className="w-36 py-3 align-middle whitespace-nowrap">
                    <Skeleton className="h-4 w-20 rounded" />
                  </TableCell>

                  {/* Frekuensi & Jadwal */}
                  <TableCell className="w-40 py-3 align-middle whitespace-nowrap">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-3 w-28 rounded" />
                    </div>
                  </TableCell>

                  {/* Tipe Komitmen Badge */}
                  <TableCell className="w-36 py-3 align-middle whitespace-nowrap">
                    <Skeleton className="h-5 w-20 rounded" />
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="w-28 text-center py-3 align-middle whitespace-nowrap">
                    <Skeleton className="h-5 w-14 rounded-full mx-auto" />
                  </TableCell>

                  {/* Aksi Button */}
                  <TableCell className="w-24 text-right py-3 align-middle whitespace-nowrap pr-4">
                    <Skeleton className="h-7 w-7 rounded-md ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* 4. Table Pagination Footer Skeleton */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/90 bg-white">
          <Skeleton className="h-4 w-48 rounded" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </TableContainer>
    </div>
  );
}
