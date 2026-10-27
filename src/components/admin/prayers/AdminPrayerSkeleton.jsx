import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function AdminPrayerSkeleton() {
  return (
    <div className="space-y-4">
      {/* Title Skeleton */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-56 rounded" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="flex-1 min-w-[220px] max-w-sm">
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-44 rounded-lg shrink-0" />
        </div>
        <div className="flex items-center gap-2 justify-end shrink-0">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                {/* 1. No. Invoice */}
                <TableHead className="w-[170px] py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                {/* 2. Donatur */}
                <TableHead className="w-52 py-2.5">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                {/* 3. Program Donasi */}
                <TableHead className="min-w-[280px] max-w-[360px] py-2.5">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                {/* 4. Nominal */}
                <TableHead className="w-32 py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-16 rounded" />
                </TableHead>
                {/* 5. Pesan Doa */}
                <TableHead className="min-w-[240px] py-2.5">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                {/* 6. Waktu Kirim */}
                <TableHead className="w-36 py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                {/* 7. Status Moderasi */}
                <TableHead className="w-28 py-2.5 text-center whitespace-nowrap">
                  <Skeleton className="h-4 w-16 mx-auto rounded" />
                </TableHead>
                {/* 8. Aksi */}
                <TableHead className="w-24 py-2.5 text-right whitespace-nowrap pr-4">
                  <Skeleton className="h-4 w-12 ml-auto rounded" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {/* 1. No. Invoice */}
                  <TableCell className="w-[170px] py-3 align-top whitespace-nowrap">
                    <Skeleton className="h-4 w-28 rounded" />
                  </TableCell>

                  {/* 2. Donatur */}
                  <TableCell className="w-52 py-3 align-top">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3 w-32 rounded" />
                      </div>
                    </div>
                  </TableCell>

                  {/* 3. Program Donasi */}
                  <TableCell className="min-w-[280px] max-w-[360px] py-3 align-top space-y-1">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </TableCell>

                  {/* 4. Nominal */}
                  <TableCell className="w-32 py-3 align-top whitespace-nowrap">
                    <Skeleton className="h-4 w-20 rounded" />
                  </TableCell>

                  {/* 5. Pesan Doa */}
                  <TableCell className="min-w-[240px] max-w-md py-3 align-top space-y-1.5">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-28 rounded" />
                  </TableCell>

                  {/* 6. Waktu Kirim */}
                  <TableCell className="w-36 py-3 align-top whitespace-nowrap">
                    <Skeleton className="h-3.5 w-28 rounded" />
                  </TableCell>

                  {/* 7. Status Moderasi */}
                  <TableCell className="w-28 text-center py-3 align-top">
                    <Skeleton className="h-5 w-16 mx-auto rounded-md" />
                  </TableCell>

                  {/* 8. Aksi */}
                  <TableCell className="w-24 text-right py-3 align-top pr-4">
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
