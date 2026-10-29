import Link from "next/link";
import { Progress } from "@/components/ui/Progress";
import { USER_ROLES } from "@/services/authService";
import { formatRupiah, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableSortHeader,
  TableEmptyRow,
  useTableSort,
} from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

export function AdminDashboardView({ userRole, stats }) {
  const transactions = stats?.recentTransactions || [];
  const volunteers = stats?.volunteerApplicants || [];
  const campaigns = stats?.campaigns || [];

  const {
    items: sortedTransactions,
    sortBy,
    sortOrder,
    handleSort,
  } = useTableSort(transactions, {
    initialSortBy: "date",
    initialSortOrder: "desc",
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left: Recent Transactions / Mutations */}
      <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              {userRole === USER_ROLES.FINANCE ? "Rekonsiliasi Mutasi Rekening & QRIS" : "Mutasi Donasi Masuk Real-Time"}
            </h2>
            <p className="text-xs text-slate-500">Pencatatan kas masuk dan verifikasi sistem</p>
          </div>
          <span className="text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded">
            Live Sinkronisasi
          </span>
        </div>

        <TableContainer>
          <Table>
            <TableHeader>
              <TableRow>
                <TableSortHeader
                  label="Invoice"
                  sortKey="id"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Donatur"
                  sortKey="donor"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Nominal"
                  sortKey="amount"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  align="right"
                />
                <TableSortHeader
                  label="Metode"
                  sortKey="channel"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Waktu"
                  sortKey="date"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Status"
                  sortKey="status"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                  align="center"
                />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.length === 0 ? (
                <TableEmptyRow colSpan={6} />
              ) : (
                sortedTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-slate-900 font-medium align-middle">{tx.id}</TableCell>
                    <TableCell className="font-normal text-slate-800 align-middle">{tx.donor}</TableCell>
                    <TableCell className="font-medium text-emerald-800 text-right align-middle">{formatRupiah(tx.amount)}</TableCell>
                    <TableCell className="font-normal text-slate-600 align-middle">{tx.channel}</TableCell>
                    <TableCell className="font-normal text-slate-600 whitespace-nowrap align-middle">{formatDate(tx.date, { withTime: true })}</TableCell>
                    <TableCell className="text-center align-middle">
                      <StatusBadge status={tx.status} label={tx.status === "PAID" ? "Lunas" : undefined} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Right: Role Context Widgets */}
      <div className="lg:col-span-4 space-y-6">
        {/* Volunteer Review Widget (for Admin / Super Admin) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-950">Review Relawan Pendaftar</h3>
            <span className="text-xs text-slate-500">{volunteers.length} Orang</span>
          </div>
          <div className="space-y-2.5">
            {volunteers.map((v) => (
              <div key={v.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <strong className="text-slate-900">{v.name}</strong>
                  <StatusBadge status={v.status} className="text-[10px] px-1.5 py-0.5" />
                </div>
                <p className="text-slate-600">{v.city}, {v.profession}</p>
                <p className="text-[11px] text-slate-500 italic">Minat: {v.event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Summary Widget */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-950">Progres Program Donasi Aktif</h3>
            <Link href="/program" className="text-xs text-primary hover:underline font-semibold">
              Lihat Semua
            </Link>
          </div>
          <div className="space-y-3">
            {campaigns.slice(0, 3).map((camp) => {
              const hasTarget = Boolean(camp.targetAmount && Number(camp.targetAmount) > 0);
              const pct = hasTarget ? Math.min(Math.round((camp.collectedAmount / camp.targetAmount) * 100), 100) : null;
              return (
                <div key={camp.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-[180px]">{camp.title}</span>
                    <span className="font-bold text-primary">{hasTarget ? `${pct}%` : "Berkelanjutan"}</span>
                  </div>
                  {hasTarget && <Progress value={pct} className="h-1.5" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
