import { ORG_PROFILE } from "@/data/orgProfile";

/**
 * Path aset berkas scan WebP legalitas resmi yayasan.
 */
export const LEGAL_DOC_ASSETS = {
  AKTA_NOTARIS: "/img/legal/akta-notaris-yayasan.webp",
  IZIN_LKS: "/img/legal/izin-operasional-lks.webp",
  DOMISILI: "/img/legal/surat-keterangan-domisili.webp",
  WATERMARK: "/img/legal/watermark-ypabe.webp",
};

/**
 * Daftar terpusat dokumen legalitas resmi yayasan (SSOT).
 * Mengintegrasikan data nomor SK/izin resmi dengan aset berkas scan WebP dan slug URL bersih.
 *
 * @param {object|null} customLegal - Override data legal dari database (opsional)
 * @returns {Array<{ id: string, slug: string, title: string, shortTitle: string, number: string, issuer: string, description: string, image: string }>}
 */
export function getLegalDocuments(customLegal = null) {
  const legal = {
    ...(ORG_PROFILE?.legal || {}),
    ...(customLegal || {}),
  };

  return [
    {
      id: "akta",
      slug: "akta-notaris",
      title: "Akta Notaris Yayasan",
      shortTitle: "Akta Notaris",
      number: legal?.aktaNotaris || "",
      issuer: "Notaris & PPAT Rudy Putranom Syafarullah, S.H.",
      description:
        "Salinan Akta Pernyataan Keputusan Rapat Gabungan Yayasan Payung Berkah No. 10 Tanggal 26 Januari 2026.",
      image: LEGAL_DOC_ASSETS.AKTA_NOTARIS,
    },
    {
      id: "izin_lks",
      slug: "izin-lks",
      title: "Izin Kegiatan LKS (Dinas Sosial)",
      shortTitle: "Izin LKS Dinsos",
      number: legal?.izinIzinSosial || "",
      issuer: "Unit Pengelola PMPTSP Kec. Cakung & Dinsos DKI Jakarta",
      description:
        "Tanda Daftar Lembaga Kesejahteraan Sosial (LKS) Luar Panti Layanan Anak & Lansia No. 006/F.2/31.75.06.1005/4/-1.848/2023.",
      image: LEGAL_DOC_ASSETS.IZIN_LKS,
    },
    {
      id: "domisili",
      slug: "surat-domisili",
      title: "Surat Keterangan Domisili",
      shortTitle: "Surat Domisili",
      number: legal?.suratDomisili || "",
      issuer: "Unit Pengelola PMPTSP Kelurahan Pulo Gebang, Jakarta Timur",
      description:
        "Surat Keterangan Domisili Sekretariat Yayasan berlaku hingga 24 April 2031 dengan tanda tangan elektronik QR Code Pemprov DKI Jakarta.",
      image: LEGAL_DOC_ASSETS.DOMISILI,
    },
  ];
}

/**
 * Mengambil satu dokumen spesifik berdasarkan slug URL bersih.
 * @param {string} slug
 * @param {object|null} customLegal
 * @returns {object|null}
 */
export function getLegalDocumentBySlug(slug, customLegal = null) {
  const docs = getLegalDocuments(customLegal);
  return docs.find((d) => d.slug === slug || d.id === slug) || null;
}
