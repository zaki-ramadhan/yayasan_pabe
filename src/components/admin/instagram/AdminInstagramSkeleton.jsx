import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/Table";

export function AdminInstagramAccountCardSkeleton() {
  return (
    <Card className="border-slate-200 bg-white shadow-xs">
      <CardContent className="p-5 sm:p-6">
        <div className="w-full">
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            {/* Foto avatar profil */}
            <div className="relative shrink-0">
              <Skeleton className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-2 border-slate-200" />
              <Skeleton className="absolute -bottom-1 -right-1 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border-2 border-white" />
            </div>

            {/* Form fields & tombol simpan */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 flex-1 w-full min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-w-0">
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-40 rounded" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>

              <div className="shrink-0 w-full sm:w-auto">
                <Skeleton className="h-10 w-full sm:w-24 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminInstagramTableSkeletonRows({ rows = 8 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i} className="hover:bg-transparent">
          {/* Checkbox */}
          <TableCell className="w-12 text-center py-2.5 px-3 align-middle">
            <Skeleton className="w-4 h-4 rounded mx-auto" />
          </TableCell>

          {/* Foto preview */}
          <TableCell className="w-16 py-2.5 align-middle">
            <Skeleton className="w-12 h-12 rounded-md shrink-0" />
          </TableCell>

          {/* Caption & tautan */}
          <TableCell className="min-w-[280px] py-2.5 align-middle">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-4/5 max-w-md rounded" />
              <Skeleton className="h-3.5 w-3/5 max-w-xs rounded" />
              <Skeleton className="h-3 w-24 rounded mt-0.5" />
            </div>
          </TableCell>

          {/* Tanggal posting */}
          <TableCell className="w-40 py-2.5 align-middle text-center">
            <Skeleton className="h-4 w-24 mx-auto rounded" />
          </TableCell>

          {/* Aksi */}
          <TableCell className="w-20 py-2.5 align-middle text-right">
            <div className="inline-flex items-center gap-1 justify-end">
              <Skeleton className="w-7 h-7 rounded-md" />
              <Skeleton className="w-7 h-7 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function AdminInstagramSkeleton() {
  return (
    <div className="space-y-6">
      {/* 1. Account profile card skeleton */}
      <AdminInstagramAccountCardSkeleton />

      {/* 2. Table section skeleton */}
      <div className="space-y-4">
        {/* Table toolbar skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="flex-1 min-w-[200px] max-w-sm">
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Skeleton className="h-5 w-24 rounded" />
            <Skeleton className="h-10 w-10 rounded-md shrink-0" />
            <Skeleton className="h-10 w-38 rounded-md shrink-0" />
          </div>
        </div>

        {/* Table container skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75 hover:bg-slate-50/75">
                  <TableHead className="w-12 text-center py-2.5 px-3">
                    <Skeleton className="w-4 h-4 rounded mx-auto" />
                  </TableHead>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead className="min-w-[280px]">Caption & Tautan</TableHead>
                  <TableHead className="w-40 text-center">Tanggal Posting</TableHead>
                  <TableHead className="w-20 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                <AdminInstagramTableSkeletonRows rows={8} />
              </TableBody>
            </Table>
          </div>

          {/* Pagination footer skeleton */}
          <div className="px-4 py-2.5 sm:px-5 sm:py-3 border-t border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-3">
            <Skeleton className="h-4 w-36 rounded" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
