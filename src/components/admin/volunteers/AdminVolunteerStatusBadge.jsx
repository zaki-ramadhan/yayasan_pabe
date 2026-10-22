export function AdminVolunteerStatusBadge({ status }) {
  switch (status) {
    case "APPROVED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 whitespace-nowrap">
          Disetujui
        </span>
      );
    case "CONTACTED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-sky-800 bg-sky-50 border border-sky-200 whitespace-nowrap">
          Dihubungi
        </span>
      );
    case "REJECTED":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-slate-700 bg-slate-100 border border-slate-300 whitespace-nowrap">
          Ditolak
        </span>
      );
    case "PENDING":
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 whitespace-nowrap">
          Menunggu
        </span>
      );
  }
}
