export const PROGRAM_MENU = [
  { label: "Semua Program Donasi", href: "/program" },
  { label: "Donasi Rutin", href: "/donasi-rutin" },
];

export const INFORMASI_MENU = [
  { label: "Laporan Akuntabilitas", href: "/laporan" },
  { label: "Distribusi", href: "/distribusi" },
  { label: "Kalkulator Zakat", href: "/kalkulator-zakat" },
  { label: "Gabung Jadi Relawan", href: "/volunteer" },
  { label: "Karier", href: "/karier" },
  { label: "Ketentuan Transaksi", href: "/ketentuan-transaksi" },
];

export const FOOTER_QUICK_LINKS = [
  { label: "Tentang Kami", href: "/tentang-kami" },
  { label: "Program Donasi", href: "/program" },
  { label: "Donasi Rutin", href: "/donasi-rutin" },
  { label: "Berita & Artikel", href: "/artikel" },
  { label: "Galeri Dokumentasi", href: "/galeri" },
  { label: "Laporan Akuntabilitas", href: "/laporan" },
  { label: "Distribusi", href: "/distribusi" },
  { label: "Kalkulator Zakat", href: "/kalkulator-zakat" },
  { label: "Gabung Relawan", href: "/volunteer" },
  { label: "Karier", href: "/karier" },
  { label: "Ketentuan Transaksi", href: "/ketentuan-transaksi" },
];

export function isNavItemActive(href, pathname) {
  if (!pathname || !href) return false;
  if (href === "/") {
    return pathname === "/";
  }
  if (href === "/program") {
    return pathname === "/program" || pathname.startsWith("/campaign") || pathname.startsWith("/program/");
  }
  if (href === "/artikel") {
    return pathname === "/artikel" || pathname.startsWith("/artikel/");
  }
  if (href === "/galeri") {
    return pathname === "/galeri" || pathname.startsWith("/galeri/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function isParentMenuActive(menuList, pathname) {
  if (!Array.isArray(menuList) || !pathname) return false;
  return menuList.some((item) => isNavItemActive(item.href, pathname));
}
