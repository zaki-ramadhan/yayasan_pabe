import { formatRupiah } from "@/lib/formatters";

export function AdminMetricCards({ stats }) {
  const totalCollected = stats?.totalCollected || 0;
  const totalDisbursed = stats?.totalDisbursed || 0;
  const activeDonors = stats?.activeDonors || 0;
  const activeCampaigns = stats?.activeCampaigns || 0;

  const cards = [
    {
      label: "Total Donasi Terhimpun",
      value: formatRupiah(totalCollected),
    },
    {
      label: "Dana Telah Disalurkan",
      value: formatRupiah(totalDisbursed),
    },
    {
      label: "Donatur Terdaftar",
      value: `${new Intl.NumberFormat("id-ID").format(activeDonors)} Jiwa`,
    },
    {
      label: "Program Donasi Aktif",
      value: `${activeCampaigns} Program`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-lg border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-2xs space-y-1"
        >
          <span className="text-sm font-medium text-slate-600 block leading-tight">
            {card.label}
          </span>
          <div className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
