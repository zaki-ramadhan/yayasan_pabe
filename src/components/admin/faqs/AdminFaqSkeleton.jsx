import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

export function AdminFaqSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Main Table Skeleton */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="py-2.5 px-4">
                  <Skeleton className="h-4 w-48" />
                </TableHead>
                <TableHead className="w-36 py-2.5 px-4">
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead className="w-36 py-2.5 px-4">
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead className="w-24 text-right py-2.5 px-4">
                  <Skeleton className="h-4 w-12 ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TableRow key={i}>
                  <TableCell className="py-3 px-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </TableCell>
                  <TableCell className="w-36 py-3 px-4">
                    <Skeleton className="h-5 w-20 rounded" />
                  </TableCell>
                  <TableCell className="w-36 py-3 px-4">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="w-24 py-3 px-4 text-right">
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
      </div>
    </div>
  );
}
