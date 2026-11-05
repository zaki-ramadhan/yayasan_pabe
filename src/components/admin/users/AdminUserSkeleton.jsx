import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";

/**
 * Skeleton loader akurat untuk halaman Kelola Pengurus Yayasan (/admin/pengguna).
 * Meniru struktur header halaman, toolbar filter, tabel 5 kolom, dan pagination footer.
 */
export function AdminUserSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* 1. Page Header Skeleton */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-56 rounded-md" />
        <Skeleton className="h-4 w-96 max-w-full rounded-md" />
      </div>

      {/* 2. Filter and Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <Skeleton className="h-10 flex-1 min-w-[200px] max-w-sm rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <Skeleton className="h-10 w-36 rounded-lg shrink-0" />
        </div>
      </div>

      {/* 3. Table Skeleton (5 Kolom Bersih) */}
      <div className="rounded-lg border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/70 border-b border-slate-200/90">
              <TableRow>
                <TableHead className="w-64 max-w-xs py-2.5 px-4">
                  <Skeleton className="h-4 w-32 rounded" />
                </TableHead>
                <TableHead className="w-36 max-w-[150px] text-center py-2.5 px-4">
                  <Skeleton className="h-4 w-16 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-56 max-w-xs py-2.5 px-4">
                  <Skeleton className="h-4 w-28 rounded" />
                </TableHead>
                <TableHead className="w-36 max-w-[150px] text-center py-2.5 px-4">
                  <Skeleton className="h-4 w-20 rounded mx-auto" />
                </TableHead>
                <TableHead className="w-20 max-w-[100px] text-right py-2.5 px-4">
                  <Skeleton className="h-4 w-10 rounded ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-100">
              <AdminUserTableSkeletonRows rows={6} />
            </TableBody>
          </Table>
        </div>

        {/* 4. Pagination Footer Skeleton */}
        <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
          <Skeleton className="h-4 w-36 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-20 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminUserTableSkeletonRows({ rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          {/* 1. Identitas Pengurus */}
          <TableCell className="w-64 max-w-xs py-3 px-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="space-y-1 min-w-0 flex-1">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-40 rounded" />
              </div>
            </div>
          </TableCell>

          {/* 2. Kontak (Centered) */}
          <TableCell className="w-36 max-w-[150px] text-center py-3 px-4">
            <Skeleton className="h-4 w-28 rounded mx-auto" />
          </TableCell>

          {/* 3. Jabatan & Akses */}
          <TableCell className="w-56 max-w-xs py-3 px-4">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-36 rounded" />
              {i % 2 === 1 && (
                <Skeleton className="h-4 w-20 rounded-md" />
              )}
            </div>
          </TableCell>

          {/* 4. Terdaftar (Centered) */}
          <TableCell className="w-36 max-w-[150px] text-center py-3 px-4">
            <Skeleton className="h-4 w-20 rounded mx-auto" />
          </TableCell>

          {/* 5. Aksi (Right) */}
          <TableCell className="w-20 max-w-[100px] text-right py-3 px-4">
            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
