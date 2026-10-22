import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

export function AdminRoutineDonationSkeleton() {
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
          <Skeleton className="h-10 flex-1 min-w-[200px] rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-60 py-2.5">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="py-2.5 min-w-[200px]">
                  <Skeleton className="h-4 w-32 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-24 rounded" />
                </TableHead>
                <TableHead className="w-40 py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="w-36 py-2.5 whitespace-nowrap">
                  <Skeleton className="h-4 w-20 rounded" />
                </TableHead>
                <TableHead className="w-28 py-2.5 text-center whitespace-nowrap">
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
                  {/* Donatur & Kontak */}
                  <TableCell className="w-60 py-3 space-y-1 align-middle">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-40 rounded" />
                  </TableCell>

                  {/* Program Kebaikan */}
                  <TableCell className="py-3 align-middle space-y-1">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </TableCell>

                  {/* Komitmen Nominal */}
                  <TableCell className="w-36 py-3 align-middle whitespace-nowrap">
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>

                  {/* Frekuensi & Jadwal */}
                  <TableCell className="w-40 py-3 align-middle space-y-1 whitespace-nowrap">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </TableCell>

                  {/* Tipe Komitmen */}
                  <TableCell className="w-36 py-3 align-middle whitespace-nowrap">
                    <Skeleton className="h-5 w-20 rounded" />
                  </TableCell>

                  {/* Status */}
                  <TableCell className="w-28 py-3 text-center align-middle whitespace-nowrap">
                    <Skeleton className="h-5 w-18 rounded-full mx-auto" />
                  </TableCell>

                  {/* Aksi */}
                  <TableCell className="w-24 py-3 text-right align-middle whitespace-nowrap">
                    <Skeleton className="h-7 w-7 rounded-md ml-auto" />
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
