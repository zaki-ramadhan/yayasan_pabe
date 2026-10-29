import {
  Table,
  TableContainer,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableSkeletonRows,
} from "@/components/ui/Table";

export default function AdminDonorsLoading() {
  return (
    <div className="space-y-4">
      {/* Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="h-10 w-full bg-slate-200/80 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-28 bg-slate-200/80 rounded-md" />
        </div>
      </div>

      {/* Table Skeleton */}
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[260px]">Donatur</TableHead>
              <TableHead className="w-44">No. Telepon</TableHead>
              <TableHead className="w-px whitespace-nowrap">Total Donasi</TableHead>
              <TableHead className="w-px whitespace-nowrap text-center">Frekuensi</TableHead>
              <TableHead className="w-px whitespace-nowrap">Terakhir Donasi</TableHead>
              <TableHead className="w-20 text-right pr-4">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeletonRows rows={8} columns={6} />
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
