import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export function AdminPrayerSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[220px] max-w-sm">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-38 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-48 sm:w-56 rounded-lg shrink-0" />
        </div>
        <div className="flex items-center gap-2 justify-end shrink-0">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-12 text-center py-2.5 px-3">
                  <Skeleton className="h-4 w-4 mx-auto rounded" />
                </TableHead>
                <TableHead className="w-[170px] py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                <TableHead className="w-52 py-2.5">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                <TableHead className="min-w-[280px] max-w-[360px] py-2.5">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="w-32 py-2.5 text-right whitespace-nowrap">
                  <Skeleton className="h-4 w-16 ml-auto rounded" />
                </TableHead>
                <TableHead className="min-w-[240px] py-2.5">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5 text-center whitespace-nowrap">
                  <Skeleton className="h-4 w-20 mx-auto rounded" />
                </TableHead>
                <TableHead className="w-32 py-2.5 text-center whitespace-nowrap pr-4">
                  <Skeleton className="h-4 w-20 mx-auto rounded" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              <AdminPrayerTableSkeletonRows rows={5} />
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export function AdminPrayerTableSkeletonRows({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          <TableCell className="w-12 text-center py-3 px-3 align-top">
            <Skeleton className="h-4 w-4 mx-auto rounded" />
          </TableCell>

          <TableCell className="w-[170px] py-3 align-top whitespace-nowrap">
            <Skeleton className="h-4 w-28 rounded" />
          </TableCell>

          <TableCell className="w-52 py-3 align-top">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full shrink-0" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-28 rounded" />
                <Skeleton className="h-3 w-32 rounded" />
              </div>
            </div>
          </TableCell>

          <TableCell className="min-w-[240px] max-w-[340px] py-3 align-top space-y-1">
            <Skeleton className="h-4 w-44 rounded" />
            <Skeleton className="h-4 w-28 rounded" />
          </TableCell>

          <TableCell className="w-32 py-3 align-top whitespace-nowrap text-right">
            <Skeleton className="h-4 w-20 ml-auto rounded" />
          </TableCell>

          <TableCell className="min-w-[240px] max-w-md py-3 align-top space-y-1.5">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <Skeleton className="h-3 w-28 rounded" />
          </TableCell>

          <TableCell className="w-36 py-3 align-top whitespace-nowrap text-center">
            <div className="space-y-1">
              <Skeleton className="h-4 w-20 mx-auto rounded" />
              <Skeleton className="h-3 w-16 mx-auto rounded" />
            </div>
          </TableCell>

          <TableCell className="w-32 text-center py-3 align-top pr-4">
            <Skeleton className="h-5 w-20 mx-auto rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
