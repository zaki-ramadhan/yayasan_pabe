import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export function AdminProgramSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
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
                <TableHead className="w-12 text-center py-2.5 px-3">
                  <Skeleton className="w-4 h-4 rounded mx-auto" />
                </TableHead>
                <TableHead className="min-w-[240px] py-2.5">
                  <Skeleton className="h-4 w-32 rounded" />
                </TableHead>
                <TableHead className="w-32 py-2.5 text-center">
                  <Skeleton className="h-4 w-16 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-56 min-w-[220px] py-2.5 text-center">
                  <Skeleton className="h-4 w-28 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-36 py-2.5 text-center">
                  <Skeleton className="h-4 w-24 rounded mx-auto" />
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
                  {/* Selection Checkbox */}
                  <TableCell className="w-12 text-center py-3 px-3 align-middle">
                    <Skeleton className="w-4 h-4 rounded mx-auto" />
                  </TableCell>

                  {/* Program Title & Details */}
                  <TableCell className="space-y-1 py-3 align-middle">
                    <Skeleton className="h-4 w-52 rounded" />
                    <Skeleton className="h-3.5 w-28 rounded" />
                  </TableCell>

                  {/* Category */}
                  <TableCell className="py-3 align-middle text-center">
                    <Skeleton className="h-5 w-20 rounded mx-auto" />
                  </TableCell>

                  {/* Target & Progress */}
                  <TableCell className="space-y-2 py-3 align-middle text-center w-56 min-w-[220px]">
                    <div className="max-w-[200px] mx-auto space-y-2">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-4 w-8 rounded" />
                      </div>
                      <Skeleton className="h-1.5 w-full rounded-full" />
                      <Skeleton className="h-3 w-28 rounded mx-auto" />
                    </div>
                  </TableCell>

                  {/* Donors & Time */}
                  <TableCell className="space-y-1.5 py-3 align-middle text-center">
                    <Skeleton className="h-4 w-20 rounded mx-auto" />
                    <Skeleton className="h-3 w-16 rounded mx-auto" />
                  </TableCell>

                  {/* Disbursed Amount */}
                  <TableCell className="space-y-1.5 py-3 align-middle">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="py-3 align-middle text-center">
                    <Skeleton className="h-5 w-16 rounded mx-auto" />
                  </TableCell>

                  {/* Action */}
                  <TableCell className="py-3 align-middle text-right">
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
