import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function AdminProgramSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Page Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-52 rounded-md" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5 max-w-2xl">
          <Skeleton className="h-10 flex-1 min-w-[200px] rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
        </div>
        <Skeleton className="h-10 w-40 rounded-lg shrink-0" />
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="min-w-[240px] py-2.5">
                  <Skeleton className="h-4 w-32 rounded" />
                </TableHead>
                <TableHead className="w-32 py-2.5 text-center">
                  <Skeleton className="h-4 w-16 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-48 py-2.5">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                <TableHead className="w-44 py-2.5">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="w-24 py-2.5 text-center">
                  <Skeleton className="h-4 w-12 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-14 py-2.5 text-right">
                  <Skeleton className="h-4 w-8 rounded ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {/* Program Title & Details */}
                  <TableCell className="space-y-1.5 py-3 align-top">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-44 rounded" />
                      <Skeleton className="h-4 w-14 rounded" />
                    </div>
                    <Skeleton className="h-3 w-28 rounded" />
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-3 align-top text-center">
                    <Skeleton className="h-5 w-20 rounded mx-auto" />
                  </TableCell>

                  {/* Target & Progress */}
                  <TableCell className="space-y-2 py-3 align-top">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-4 w-8 rounded" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </TableCell>

                  {/* Donors & Time */}
                  <TableCell className="space-y-1.5 py-3 align-top">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </TableCell>

                  {/* Disbursed Amount */}
                  <TableCell className="space-y-1.5 py-3 align-top">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 align-top text-center">
                    <Skeleton className="h-5 w-16 rounded mx-auto" />
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-3 align-top text-right">
                    <Skeleton className="h-8 w-8 rounded ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-200/90 flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
