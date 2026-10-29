import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export function AdminArticleSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2.5 max-w-lg">
          <Skeleton className="h-10 flex-1 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg shrink-0" />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg" />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-16 py-2.5">
                  <Skeleton className="h-4 w-12 rounded" />
                </TableHead>
                <TableHead className="py-2.5">
                  <Skeleton className="h-4 w-32 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5 text-center">
                  <Skeleton className="h-4 w-20 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-40 py-2.5">
                  <Skeleton className="h-4 w-16 rounded" />
                </TableHead>
                <TableHead className="w-32 py-2.5">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                <TableHead className="w-24 py-2.5 text-center">
                  <Skeleton className="h-4 w-16 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-28 py-2.5 text-right">
                  <Skeleton className="h-4 w-12 rounded ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {/* Banner */}
                  <TableCell className="w-16 py-2.5 align-middle">
                    <Skeleton className="w-12 h-9 rounded" />
                  </TableCell>

                  {/* Title & Slug */}
                  <TableCell className="space-y-1.5 py-2.5 align-middle">
                    <Skeleton className="h-4 w-64 max-w-full rounded" />
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </TableCell>

                  {/* Category */}
                  <TableCell className="w-36 py-2.5 text-center align-middle">
                    <Skeleton className="h-5 w-24 rounded mx-auto" />
                  </TableCell>

                  {/* Author */}
                  <TableCell className="w-40 py-2.5 align-middle">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-6 rounded-full shrink-0" />
                      <Skeleton className="h-3.5 w-20 rounded" />
                    </div>
                  </TableCell>

                  {/* Published Date */}
                  <TableCell className="w-32 py-2.5 align-middle">
                    <Skeleton className="h-3.5 w-24 rounded" />
                  </TableCell>

                  {/* Likes/Appreciation */}
                  <TableCell className="w-24 py-2.5 text-center align-middle">
                    <Skeleton className="h-4 w-10 rounded mx-auto" />
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="w-28 py-2.5 text-right align-middle">
                    <div className="flex items-center justify-end gap-1.5">
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
