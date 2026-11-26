import { Badge } from "@/components/ui/Badge";
import {
  Table,
  TableContainer,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

const ZAKAT_GUIDE_ROWS = [
  {
    no: 1,
    jenis: "Profesi",
    nishab: "85 gr Emas",
    nishabNote: "Mengikuti harga emas berlaku",
    kadar: "2,5%",
    waktu: "Saat menerima",
  },
  {
    no: 2,
    jenis: "Emas",
    nishab: "85 gr",
    nishabNote: null,
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
    <TableContainer>
      <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/70">
        <h2 className="text-base sm:text-lg font-semibold text-slate-900">
          Tabel panduan perhitungan zakat
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Standar nisab, kadar, dan waktu penunaian zakat resmi Yayasan Payung Berkah sesuai syariat Islam.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-14 text-center">No</TableHead>
            <TableHead>Jenis zakat</TableHead>
            <TableHead>Nishab</TableHead>
            <TableHead className="text-center">Kadar</TableHead>
            <TableHead>Waktu penunaian</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ZAKAT_GUIDE_ROWS.map((row) => (
            <TableRow key={row.no}>
              <TableCell className="text-center text-slate-500 tabular-nums">{row.no}</TableCell>
              <TableCell className="font-medium text-slate-900">{row.jenis}</TableCell>
              <TableCell>
                <span className="font-medium text-slate-900">{row.nishab}</span>
                {row.nishabNote && (
                  <span className="block text-xs text-slate-600 mt-0.5">{row.nishabNote}</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="success" className="max-w-none whitespace-nowrap">
                  {row.kadar}
                </Badge>
              </TableCell>
              <TableCell className="text-slate-700">{row.waktu}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
