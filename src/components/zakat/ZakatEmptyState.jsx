import { cn } from "@/lib/utils";

/**
 * Molecule: Panel hasil kalkulasi sebelum formulir dihitung
 */
export function ZakatEmptyState({ className }) {
  return (
    <div
      className={cn(
        "h-full min-h-[360px] flex flex-col items-center justify-center p-8 rounded-lg bg-white border border-slate-200 text-center space-y-2 shadow-xs",
        className
      )}
    >
      <h3 className="text-xl font-medium text-slate-950 max-w-xs leading-snug">
        Hasil perhitungan akan<br></br> tampil di sini
      </h3>
      <p className="text-sm text-slate-600 leading-relaxed max-w-xs">
        Isi nominal objek zakat pada formulir di samping lalu klik tombol Hitung Zakat
      </p>
    </div>
  );
}
