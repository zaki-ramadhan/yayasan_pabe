import { getAdminAuditReports } from "@/services/auditReportAdminService";
import { AdminAuditReportTable } from "@/components/admin/audit-reports/AdminAuditReportTable";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export const metadata = {
  title: "Laporan Audit & Akuntabilitas Keuangan",
  description: "Kelola dokumen laporan keuangan dan transparansi penyaluran yayasan.",
};

export default async function AdminAuditReportPage() {
  const reports = await getAdminAuditReports();

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Laporan audit keuangan independen"
        description="Kelola berkas dan publikasi laporan audit keuangan."
      />

      <AdminAuditReportTable initialReports={reports} />
    </div>
  );
}
