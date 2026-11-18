import { formatRupiah } from "@/lib/formatters";
import { DEFAULT_ANNUAL_NISAB, DEFAULT_MONTHLY_NISAB } from "@/lib/zakat/constants";

const ZAKAT_GUIDE_ROWS = [
  {
    no: 1,
    jenis: "Profesi",
    nishab: "85 gr Emas",
    nishabNote: `(± ${formatRupiah(DEFAULT_MONTHLY_NISAB)} / bln)`,
    kadar: "2,5%",
    waktu: "Saat menerima",
  },
  {
    no: 2,
    jenis: "Emas",
    nishab: "85 gr",
    nishabNote: `(± ${formatRupiah(DEFAULT_ANNUAL_NISAB)})`,
    kadar: "2,5%",
    waktu: "Setelah 1 tahun (haul)",
  },
  {
    no: 3,
    jenis: "Perak",
    nishab: "595 gr",
    nishabNote: null,
    kadar: "2,5%",
    waktu: "Setelah 1 tahun (haul)",
  },
  {
    no: 4,
    jenis: "Perdagangan",
    nishab: "85 gr Emas",
    nishabNote: "Aset lancar + laba",
    kadar: "2,5%",
    waktu: "Setelah 1 tahun (haul)",
  },
  {
    no: 5,
    jenis: "Perusahaan",
    nishab: "85 gr Emas",
    nishabNote: "Entitas bisnis berjalan",
    kadar: "2,5%",
    waktu: "Setelah 1 tahun (haul)",
  },
  {
    no: 6,
    jenis: "Tabungan",
    nishab: "85 gr Emas",
    nishabNote: "Uang mengendap/deposito",
    kadar: "2,5%",
    waktu: "Setelah 1 tahun (haul)",
  },
  {
    no: 7,
    jenis: "Pertanian",
    nishab: "522 kg beras / 653 kg gabah",
    nishabNote: null,
    kadar: "10% tadah hujan / 5% irigasi",
    waktu: "Saat panen",
  },
];

export function ZakatGuideTable() {
  return (
    <section className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Tabel panduan perhitungan zakat
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Standar nisab, kadar, dan waktu penunaian zakat resmi Yayasan Payung Berkah sesuai syariat Islam.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-700">
              <th scope="col" className="py-3 px-4 w-12 text-center">No</th>
              <th scope="col" className="py-3 px-4">Jenis zakat</th>
              <th scope="col" className="py-3 px-4">Nishab</th>
              <th scope="col" className="py-3 px-4 text-center">Kadar</th>
              <th scope="col" className="py-3 px-4">Waktu penunaian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {ZAKAT_GUIDE_ROWS.map((row) => (
              <tr key={row.no} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3 px-4 font-medium text-slate-500 text-center">{row.no}</td>
                <td className="py-3 px-4 font-semibold text-slate-900">{row.jenis}</td>
                <td className="py-3 px-4">
                  <span className="font-medium text-slate-900">{row.nishab}</span>
                  {row.nishabNote && (
                    <span className="block text-xs text-slate-600 mt-0.5">{row.nishabNote}</span>
                  )}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                    {row.kadar}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-700 text-xs sm:text-sm">{row.waktu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 sm:p-5 bg-slate-50/70 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-slate-600">
        <div>
          <span className="font-semibold text-slate-900">Rekening resmi zakat &amp; donasi:</span>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-mono text-xs text-slate-800">
            <span>Bank BRI: <strong className="font-semibold text-slate-900">0424-01-000858-568</strong></span>
            <span>Bank Mandiri: <strong className="font-semibold text-slate-900">166-000-3644-119</strong></span>
          </div>
        </div>
        <div className="text-xs text-slate-600">
          a.n. <strong>Yayasan Payung Berkah</strong>
        </div>
      </div>
    </section>
  );
}

