import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRupiah, formatNumber } from "@/lib/formatters";

/**
 * Audit Report Card for financial transparency documents
 * @param {object} report - Report metadata and financial totals
 */
export function AuditReportCard({ report }) {
  return (
    <div className="p-5 sm:p-6 bg-white rounded-xl border border-slate-300 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3.5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 text-sm">
            <span className="font-medium text-slate-900">Tahun Buku {report.year}</span>
            <span className="font-medium text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded text-sm">
              {report.opinionStatus}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-slate-950">{report.title}</h3>
          <p className="text-sm text-slate-700">Kantor Akuntan Publik: {report.auditorName}</p>
        </div>

        <a
          href={report.pdfUrl || `/api/documents/download?type=audit&year=${report.year}`}
          download={`Laporan-Audit-Keuangan-PABE-${report.year}.pdf`}
          className="group inline-block shrink-0"
        >
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-4 text-sm font-medium border-slate-300 text-slate-900 hover:bg-slate-50 cursor-pointer"
          >
            <Download className="w-4 h-4 mr-1.5 text-slate-600 group-hover:text-primary group-hover:-translate-y-0.5 transition-all" />
            Unduh Dokumen PDF
          </Button>
        </a>
      </div>

      {/* Financial Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50 rounded-lg border border-slate-200 p-4 text-sm">
        <div className="py-2 sm:py-0 sm:px-3 first:pl-0 space-y-0.5">
          <span className="text-sm font-normal text-slate-600 block">Total Dana Masuk</span>
          <span className="font-medium text-slate-950 text-base block">
            {formatRupiah(report.totalFundsIn)}
          </span>
        </div>
        <div className="py-2 sm:py-0 sm:px-3 space-y-0.5">
          <span className="text-sm font-normal text-slate-600 block">Total Penyaluran</span>
          <span className="font-medium text-emerald-800 text-base block">
            {formatRupiah(report.totalFundsOut)}
          </span>
        </div>
        <div className="py-2 sm:py-0 sm:px-3 space-y-0.5">
          <span className="text-sm font-normal text-slate-600 block">Penerima Manfaat</span>
          <span className="font-medium text-slate-950 text-base block">
            {formatNumber(report.beneficiaryCount)} Orang
          </span>
        </div>
        <div className="py-2 sm:py-0 sm:px-3 last:pr-0 space-y-0.5">
          <span className="text-sm font-normal text-slate-600 block">Rasio Operasional</span>
          <span className="font-medium text-slate-950 text-base block">
            {report.operationalRatio}
          </span>
        </div>
      </div>

      <p className="text-base text-slate-800 leading-relaxed">
        {report.summary}
      </p>
    </div>
  );
}
