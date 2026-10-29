import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";

export function AdminUserSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Filter and Action Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-40 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-px py-2.5 px-4"><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="w-1/3 py-2.5 px-4"><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead className="py-2.5 px-4"><Skeleton className="h-4 w-24" /></TableHead>
                <TableHead className="py-2.5 px-4"><Skeleton className="h-4 w-28" /></TableHead>
                <TableHead className="py-2.5 px-4"><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead className="py-2.5 px-4"><Skeleton className="h-4 w-16" /></TableHead>
                <TableHead className="w-px py-2.5 px-4 text-center"><Skeleton className="h-4 w-8 mx-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="py-3 px-4">
                    <Skeleton className="w-8 h-8 rounded-full" />
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3.5 w-44" />
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Skeleton className="h-5 w-24 rounded" />
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Skeleton className="h-5 w-16 rounded" />
                  </TableCell>
                  <TableCell className="py-3 px-4 text-center">
                    <Skeleton className="h-6 w-6 rounded-md mx-auto" />
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
