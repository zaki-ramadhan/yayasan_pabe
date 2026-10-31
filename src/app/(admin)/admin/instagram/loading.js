import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableSkeletonRows,
} from "@/components/ui/Table";

export default function AdminInstagramLoading() {
  return (
    <div className="space-y-6">
      {/* 1. Account Profile Card Skeleton */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs animate-pulse">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-slate-200" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-48 bg-slate-200 rounded" />
            </div>
          </div>
          <div className="h-9 w-28 bg-slate-200 rounded-lg" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-3 w-16 bg-slate-200 rounded" />
              <div className="h-4 w-24 bg-slate-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* 2. Table Section Skeleton */}
      <div className="space-y-4">
        {/* Toolbar Skeleton */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 animate-pulse">
          <div className="h-10 flex-1 max-w-sm bg-slate-200/80 rounded-lg" />
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="h-5 w-24 bg-slate-200/80 rounded" />
            <div className="h-10 w-10 bg-slate-200/80 rounded-md" />
            <div className="h-10 w-36 bg-slate-200/80 rounded-lg" />
          </div>
        </div>

        {/* Table Container Skeleton */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/75">
                  <TableHead className="w-12 text-center py-2.5 px-3">
                    <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                  </TableHead>
                  <TableHead className="w-16">Foto</TableHead>
                  <TableHead className="min-w-[280px]">Caption & Tautan</TableHead>
                  <TableHead className="w-40 text-center">Tanggal Posting</TableHead>
                  <TableHead className="w-20 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableSkeletonRows
                  rows={8}
                  columns={5}
                  cellAlignments={["center", "left", "left", "center", "right"]}
                />
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
