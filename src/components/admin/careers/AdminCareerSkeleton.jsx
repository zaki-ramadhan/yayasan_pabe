import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export function AdminCareerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 max-w-lg">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg shrink-0" />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-48 rounded-lg" />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-12 text-center py-2.5 px-3">
                  <Skeleton className="w-4 h-4 rounded mx-auto" />
                </TableHead>
                <TableHead className="min-w-[260px] w-64 py-2.5">
                  <Skeleton className="h-4 w-32 rounded" />
                </TableHead>
                <TableHead className="min-w-[200px] w-56 py-2.5">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="min-w-[160px] w-48 py-2.5">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5 text-center">
                  <Skeleton className="h-4 w-24 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-32 py-2.5 text-center">
                  <Skeleton className="h-4 w-20 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-28 py-2.5 text-center">
                  <Skeleton className="h-4 w-16 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-24 py-2.5 text-right">
                  <Skeleton className="h-4 w-12 rounded ml-auto" />
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

                  {/* Position & Code */}
                  <TableCell className="min-w-[260px] w-64 space-y-1.5 py-3 align-middle">
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-44 rounded" />
                      <Skeleton className="h-3.5 w-28 rounded" />
                    </div>
                    <Skeleton className="h-3 w-32 rounded" />
                  </TableCell>

                  {/* Department & System */}
                  <TableCell className="min-w-[200px] w-56 space-y-1.5 py-3 align-middle">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </TableCell>

                  {/* Location */}
                  <TableCell className="min-w-[160px] w-48 py-3 align-middle">
                    <Skeleton className="h-3.5 w-28 rounded" />
                  </TableCell>

                  {/* Deadline */}
                  <TableCell className="w-36 py-3 text-center align-middle">
                    <Skeleton className="h-4 w-24 rounded mx-auto" />
                  </TableCell>

                  {/* Applicants */}
                  <TableCell className="w-32 py-3 text-center align-middle">
                    <Skeleton className="h-7 w-20 rounded-md mx-auto" />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="w-28 py-3 text-center align-middle">
                    <Skeleton className="h-5 w-16 rounded mx-auto" />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="w-24 py-3 text-right align-middle">
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
