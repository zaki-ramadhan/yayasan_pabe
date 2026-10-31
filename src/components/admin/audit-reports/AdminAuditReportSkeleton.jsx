import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export function AdminAuditReportSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-sm">
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-44 rounded-lg shrink-0" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-12 text-center py-2.5 px-3">
                  <Skeleton className="w-4 h-4 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-28 py-2.5 text-center">
                  <Skeleton className="h-4 w-16 mx-auto rounded" />
                </TableHead>
                <TableHead className="py-2.5 min-w-[280px] sm:min-w-[360px] max-w-lg">
                  <Skeleton className="h-4 w-44 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5 text-center whitespace-nowrap">
                  <Skeleton className="h-4 w-20 mx-auto rounded" />
                </TableHead>
                <TableHead className="w-56 py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-36 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5 text-center whitespace-nowrap">
                  <Skeleton className="h-4 w-24 mx-auto rounded" />
                </TableHead>
                <TableHead className="w-24 py-2.5 text-right whitespace-nowrap pr-4">
                  <Skeleton className="h-4 w-10 ml-auto rounded" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell className="w-12 text-center py-3.5 px-3 align-middle">
                    <Skeleton className="w-4 h-4 rounded mx-auto" />
                  </TableCell>
                  <TableCell className="w-28 text-center py-3.5 align-middle">
                    <Skeleton className="h-5 w-12 mx-auto rounded" />
                  </TableCell>
                  <TableCell className="py-3.5 align-middle space-y-1.5 min-w-[280px] sm:min-w-[360px] max-w-lg">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-3.5 w-64 rounded" />
                  </TableCell>
                  <TableCell className="w-36 text-center py-3.5 align-middle">
                    <Skeleton className="h-5 w-24 mx-auto rounded-md" />
                  </TableCell>
                  <TableCell className="w-56 py-3.5 align-middle space-y-1.5 whitespace-nowrap">
                    <Skeleton className="h-3.5 w-36 rounded" />
                    <Skeleton className="h-3.5 w-32 rounded" />
                  </TableCell>
                  <TableCell className="w-36 text-center py-3.5 align-middle space-y-1">
                    <Skeleton className="h-4 w-16 mx-auto rounded" />
                    <Skeleton className="h-3.5 w-20 mx-auto rounded" />
                  </TableCell>
                  <TableCell className="w-24 text-right py-3.5 align-middle pr-4">
                    <div className="flex items-center justify-end gap-1">
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-7 w-7 rounded-md" />
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
