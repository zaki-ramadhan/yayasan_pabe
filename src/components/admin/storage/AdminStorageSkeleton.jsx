import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

/**
 * Skeleton loading presisi tinggi untuk halaman manajemen penyimpanan Cloudflare R2.
 * Mereplikasi struktur AdminPageHeader, StorageStatsCard, StorageScanToolbar, dan StorageOrphanTable.
 */
export function AdminStorageSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      {/* 1. StorageCapacityBanner Skeleton */}
        <div className="bg-white border border-slate-200/90 rounded-xl shadow-2xs overflow-hidden flex flex-col md:flex-row items-stretch">
          <div className="w-full md:w-28 lg:w-32 bg-slate-100 flex items-center justify-center p-2.5 shrink-0 min-h-[72px] md:min-h-0">
            <Skeleton className="w-12 h-12 rounded-lg" />
          </div>
          <div className="flex-1 py-3 px-3.5 sm:py-3.5 sm:px-5 flex flex-col justify-center space-y-2.5 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <Skeleton className="h-5 w-48 rounded" />
                <Skeleton className="h-3.5 w-72 max-w-full rounded" />
                <Skeleton className="h-3.5 w-36 rounded" />
              </div>
              <Skeleton className="h-9 w-36 rounded-lg shrink-0 self-start sm:self-center" />
            </div>
            <div className="flex items-center gap-2.5 pt-0.5">
              <Skeleton className="h-2 flex-1 bg-slate-100 rounded-full" />
              <Skeleton className="h-4.5 w-20 rounded-md shrink-0" />
            </div>
          </div>
        </div>

        {/* StorageFolderBreakdownCard Skeleton */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <Skeleton className="w-4.5 h-4.5 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <Skeleton className="h-3.5 w-24 rounded" />
        </div>

        <div className="rounded-lg border border-slate-200/80 bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50 border-b border-slate-200">
              <TableRow>
                  <TableHead className="py-2.5 px-2.5">
                    <Skeleton className="h-4 w-16 rounded" />
                  </TableHead>
                  <TableHead className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-20 rounded ml-auto" />
                  </TableHead>
                  <TableHead className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-16 rounded ml-auto" />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {/* Folder 1: Expanded with 2 child file rows */}
                <TableRow className="hover:bg-transparent">
                  <TableCell className="py-2.5 px-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3.5 h-3.5 rounded" />
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-4 w-36 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-16 rounded ml-auto" />
                  </TableCell>
                  <TableCell className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-20 rounded ml-auto" />
                  </TableCell>
                </TableRow>
                <TableRow className="bg-slate-50/50 hover:bg-transparent">
                  <TableCell className="py-1.5 px-2.5 pl-9 sm:pl-10">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-3.5 w-52 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-2.5 text-right">
                    <Skeleton className="h-3.5 w-14 rounded ml-auto" />
                  </TableCell>
                  <TableCell className="py-1.5 px-2.5 text-right">
                    <Skeleton className="h-3.5 w-16 rounded ml-auto" />
                  </TableCell>
                </TableRow>
                <TableRow className="bg-slate-50/50 hover:bg-transparent">
                  <TableCell className="py-1.5 px-2.5 pl-9 sm:pl-10">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-4 h-4 rounded" />
                      <Skeleton className="h-3.5 w-44 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="py-1.5 px-2.5 text-right">
                    <Skeleton className="h-3.5 w-14 rounded ml-auto" />
                  </TableCell>
                  <TableCell className="py-1.5 px-2.5 text-right">
                    <Skeleton className="h-3.5 w-14 rounded ml-auto" />
                  </TableCell>
                </TableRow>

                {/* Folder 2: Collapsed */}
                <TableRow className="hover:bg-transparent">
                  <TableCell className="py-2.5 px-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3.5 h-3.5 rounded" />
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-4 w-32 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-16 rounded ml-auto" />
                  </TableCell>
                  <TableCell className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-16 rounded ml-auto" />
                  </TableCell>
                </TableRow>

                {/* Folder 3: Collapsed */}
                <TableRow className="hover:bg-transparent">
                  <TableCell className="py-2.5 px-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3.5 h-3.5 rounded" />
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-4 w-28 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-16 rounded ml-auto" />
                  </TableCell>
                  <TableCell className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-12 rounded ml-auto" />
                  </TableCell>
                </TableRow>

                {/* Folder 4: Collapsed */}
                <TableRow className="hover:bg-transparent">
                  <TableCell className="py-2.5 px-2.5">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3.5 h-3.5 rounded" />
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="h-4 w-24 rounded" />
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-16 rounded ml-auto" />
                  </TableCell>
                  <TableCell className="py-2.5 px-2.5 text-right">
                    <Skeleton className="h-4 w-12 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

      {/* 3. StorageScanToolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <Skeleton className="h-10 flex-1 min-w-[200px] max-w-xs rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
        </div>
        <Skeleton className="h-10 w-52 rounded-lg shrink-0 self-start sm:self-auto" />
      </div>

      {/* 4. StorageOrphanTable Skeleton */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow>
                <TableHead className="w-12 text-center py-2.5">
                  <Skeleton className="w-4 h-4 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-16 py-2.5">
                  <Skeleton className="h-4 w-12 rounded" />
                </TableHead>
                <TableHead className="py-2.5">
                  <Skeleton className="h-4 w-44 rounded" />
                </TableHead>
                <TableHead className="w-28 text-center py-2.5">
                  <Skeleton className="h-4 w-14 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-28 text-right py-2.5">
                  <Skeleton className="h-4 w-14 rounded ml-auto" />
                </TableHead>
                <TableHead className="w-40 py-2.5">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                <TableHead className="w-20 text-center py-2.5">
                  <Skeleton className="h-4 w-8 rounded mx-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3].map((i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell className="text-center py-3">
                    <Skeleton className="w-4 h-4 rounded mx-auto" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="w-12 h-12 rounded-md" />
                  </TableCell>
                  <TableCell className="space-y-1.5 py-3">
                    <Skeleton className="h-4 w-56 max-w-full rounded" />
                    <Skeleton className="h-3.5 w-72 max-w-full rounded" />
                    <Skeleton className="h-4.5 w-28 rounded mt-1" />
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Skeleton className="h-5 w-20 rounded-md mx-auto" />
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <Skeleton className="h-4 w-16 rounded ml-auto" />
                  </TableCell>
                  <TableCell className="py-3">
                    <Skeleton className="h-4 w-28 rounded" />
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <Skeleton className="w-8 h-8 rounded-md mx-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
