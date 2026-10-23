import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function AdminVolunteerSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Page Header */}
      <div className="space-y-1.5">
        <Skeleton className="h-6 w-64 rounded-md" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5 max-w-xl">
          <Skeleton className="h-10 flex-1 min-w-[220px] rounded-lg" />
          <Skeleton className="h-10 w-44 rounded-lg shrink-0" />
        </div>
        <Skeleton className="h-10 w-28 rounded-lg shrink-0" />
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-64 py-2.5">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-16 rounded" />
                </TableHead>
                <TableHead className="py-2.5 min-w-[200px]">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                <TableHead className="w-32 py-2.5 text-center whitespace-nowrap">
                  <Skeleton className="h-4 w-16 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-24 py-2.5 text-right whitespace-nowrap">
                  <Skeleton className="h-4 w-10 ml-auto rounded" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  {/* Nama & Kontak dengan Avatar */}
                  <TableCell className="w-64 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3.5 w-36 rounded" />
                      </div>
                    </div>
                  </TableCell>

                  {/* Domisili */}
                  <TableCell className="w-36 py-3 align-middle whitespace-nowrap">
                    <Skeleton className="h-4 w-20 rounded" />
                  </TableCell>

                  {/* Bidang Minat */}
                  <TableCell className="py-3 align-middle space-y-1">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-4 w-64 rounded" />
                  </TableCell>

                  {/* Tanggal Daftar */}
                  <TableCell className="w-36 py-3 align-middle whitespace-nowrap">
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="w-32 py-3 text-center align-middle whitespace-nowrap">
                    <Skeleton className="h-5 w-20 rounded mx-auto" />
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="w-24 py-3 text-right align-middle whitespace-nowrap">
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
