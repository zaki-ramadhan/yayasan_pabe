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
                <TableHead className="w-56 py-2.5 px-4"><Skeleton className="h-4 w-32" /></TableHead>
                <TableHead className="w-40 py-2.5 px-4"><Skeleton className="h-4 w-20" /></TableHead>
                <TableHead className="w-44 py-2.5 px-4"><Skeleton className="h-4 w-28" /></TableHead>
                <TableHead className="w-28 text-center py-2.5 px-4"><Skeleton className="h-4 w-16 mx-auto" /></TableHead>
                <TableHead className="w-36 text-center py-2.5 px-4"><Skeleton className="h-4 w-20 mx-auto" /></TableHead>
                <TableHead className="w-32 text-right py-2.5 px-4"><Skeleton className="h-4 w-12 ml-auto" /></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  {/* 1. Identitas Pengurus */}
                  <TableCell className="w-56 py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-36" />
                      </div>
                    </div>
                  </TableCell>
                  {/* 2. Kontak */}
                  <TableCell className="w-40 py-3 px-4">
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  {/* 3. Peran & Jabatan */}
                  <TableCell className="w-44 py-3 px-4">
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-20 rounded" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </TableCell>
                  {/* 4. Status */}
                  <TableCell className="w-28 text-center py-3 px-4">
                    <Skeleton className="h-5 w-16 rounded mx-auto" />
                  </TableCell>
                  {/* 5. Terdaftar */}
                  <TableCell className="w-36 text-center py-3 px-4">
                    <Skeleton className="h-4 w-20 mx-auto" />
                  </TableCell>
                  {/* 6. Aksi */}
                  <TableCell className="w-32 text-right py-3 px-4">
                    <Skeleton className="h-8 w-8 rounded-md ml-auto" />
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
