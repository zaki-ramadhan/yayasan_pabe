import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function AdminTransactionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5 max-w-2xl">
          <Skeleton className="h-10 flex-1 min-w-[220px] rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-44 rounded-lg shrink-0" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg shrink-0" />
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-px py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                <TableHead className="w-px py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                <TableHead className="w-full min-w-[220px] py-2.5">
                  <Skeleton className="h-4 w-32 rounded" />
                </TableHead>
                <TableHead className="w-px py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                <TableHead className="w-px py-2.5 text-center whitespace-nowrap">
                  <Skeleton className="h-4 w-24 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-px py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-16 rounded" />
                </TableHead>
                <TableHead className="w-px py-2.5 text-center whitespace-nowrap">
                  <Skeleton className="h-4 w-14 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-24 py-2.5 text-right whitespace-nowrap">
                  <Skeleton className="h-4 w-10 ml-auto rounded" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {/* Invoice */}
                  <TableCell className="w-px py-3 whitespace-nowrap align-middle">
                    <div className="flex items-center gap-1.5">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                  </TableCell>

                  {/* Donor */}
                  <TableCell className="w-px py-3 whitespace-nowrap align-middle">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3 w-36 rounded" />
                      </div>
                    </div>
                  </TableCell>

                  {/* Campaign Target */}
                  <TableCell className="py-3 align-middle">
                    <Skeleton className="h-4 w-full max-w-sm rounded" />
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="w-px py-3 whitespace-nowrap align-middle">
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>

                  {/* Payment Method */}
                  <TableCell className="w-px py-3 text-center whitespace-nowrap align-middle">
                    <Skeleton className="h-5 w-20 rounded mx-auto" />
                  </TableCell>

                  {/* Date */}
                  <TableCell className="w-px py-3 whitespace-nowrap align-middle">
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="w-px py-3 text-center whitespace-nowrap align-middle">
                    <Skeleton className="h-5 w-16 rounded mx-auto" />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="w-24 py-3 text-right whitespace-nowrap align-middle">
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
