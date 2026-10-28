import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function AdminDistributionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <Skeleton className="h-10 w-48 rounded-lg shrink-0" />
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-72 py-2.5">
                  <Skeleton className="h-4 w-36 rounded" />
                </TableHead>
                <TableHead className="py-2.5">
                  <Skeleton className="h-4 w-48 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="w-40 py-2.5 text-right">
                  <Skeleton className="h-4 w-28 rounded ml-auto" />
                </TableHead>
                <TableHead className="w-24 py-2.5 text-right whitespace-nowrap">
                  <Skeleton className="h-4 w-12 rounded ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {/* Origin Program */}
                  <TableCell className="w-72 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-10 h-10 rounded-md shrink-0" />
                      <Skeleton className="h-4 w-44 rounded" />
                    </div>
                  </TableCell>

                  {/* Activity Title & Content */}
                  <TableCell className="space-y-1.5 py-3 align-middle">
                    <Skeleton className="h-4 w-72 rounded" />
                    <Skeleton className="h-4 w-full max-w-lg rounded" />
                  </TableCell>

                  {/* Realization Date */}
                  <TableCell className="w-36 py-3 align-middle whitespace-nowrap">
                    <Skeleton className="h-3.5 w-24 rounded" />
                  </TableCell>

                  {/* Disbursed Amount */}
                  <TableCell className="w-40 py-3 align-middle text-right whitespace-nowrap">
                    <Skeleton className="h-4 w-28 rounded ml-auto" />
                  </TableCell>

                  {/* Action */}
                  <TableCell className="w-24 py-3 align-middle text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <Skeleton className="h-7 w-7 rounded" />
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
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
