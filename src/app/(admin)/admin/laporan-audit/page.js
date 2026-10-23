import { getAdminAuditReports } from "@/services/auditReportAdminService";
import { AdminAuditReportTable } from "@/components/admin/audit-reports/AdminAuditReportTable";

export const metadata = {
  title: "Laporan Audit Keuangan",
  description: "Kelola laporan audit independen, opini WTP, dan transparansi keuangan yayasan.",
};

export default async function AdminAuditReportPage() {
  const reports = await getAdminAuditReports();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base sm:text-lg font-medium text-slate-900 leading-tight">
          Laporan audit keuangan independen
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Kelola publikasi transparansi tahunan dari kantor akuntan publik independen dengan opini wajar tanpa pengecualian (WTP) untuk publik donatur.
        </p>
      </div>

      <AdminAuditReportTable initialReports={reports} />
    </div>
  );
}
