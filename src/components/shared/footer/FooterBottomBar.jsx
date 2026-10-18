import Link from "next/link";

/**
 * Bottom copyright notice and legal links for footer
 */
export function FooterBottomBar() {
  return (
    <div className="pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-200">
      <p>© {new Date().getFullYear()} Yayasan PABE. Seluruh hak cipta dilindungi.</p>
      <div className="flex items-center gap-3">
        <Link href="/tentang-kami" className="text-slate-200 hover:text-white transition-colors">
          Kebijakan Privasi
        </Link>
        <span className="text-slate-700 select-none">/</span>
        <Link href="/laporan" className="text-slate-200 hover:text-white transition-colors">
          Transparansi Publik
        </Link>
        <span className="text-slate-700 select-none">/</span>
        <Link href="/ketentuan-transaksi" className="text-slate-200 hover:text-white transition-colors">
          Ketentuan ZISWAF
        </Link>
      </div>
    </div>
  );
}
