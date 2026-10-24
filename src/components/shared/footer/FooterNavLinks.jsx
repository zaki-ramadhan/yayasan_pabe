import Link from "next/link";

const DEFAULT_NAV_LINKS = [
  { href: "/program", label: "Program Kebaikan" },
  { href: "/kalkulator-zakat", label: "Kalkulator Zakat" },
  { href: "/laporan", label: "Laporan Keuangan" },
  { href: "/tentang-kami", label: "Profil Pengurus" },
  { href: "/artikel", label: "Kabar Lapangan" },
  { href: "/volunteer", label: "Pendaftaran Relawan" },
];

/**
 * Quick navigation links list for footer
 *
 * @param {object} props
 * @param {Array} [props.links] - Navigation items
 */
export function FooterNavLinks({ links = DEFAULT_NAV_LINKS }) {
  return (
    <div className="space-y-3.5">
      <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
        Navigasi Cepat
      </h4>
      <ul className="space-y-2 text-sm">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block text-sm text-slate-200 hover:text-white hover:underline underline-offset-2 transition-colors py-0.5"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
