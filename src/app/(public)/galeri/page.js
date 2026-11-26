import { Suspense } from "react";
import { getPublicGalleryItems } from "@/services/galleryService";
import { PageHeader } from "@/components/shared/PageHeader";
import { GalleryCatalog } from "@/components/gallery/GalleryCatalog";
import { GallerySkeleton } from "@/components/gallery/GallerySkeleton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galeri Dokumentasi & Rekam Jejak Kegiatan",
  description:
    "Dokumentasi foto penyaluran amanah donatur, santunan yatim, program sosial, dan aksi kemanusiaan Yayasan Payung Berkah.",
  openGraph: {
    title: "Galeri Dokumentasi & Rekam Jejak - Yayasan Payung Berkah",
    description:
      "Potret nyata amanah donatur dan kebaikan yang telah terlaksana bersama para mustahik dan anak yatim binaan.",
    url: "/galeri",
    type: "website",
    images: [
      {
        url: "/img/branding/logo-ypabe.webp",
        width: 1200,
        height: 630,
        alt: "Galeri Dokumentasi Yayasan Payung Berkah",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Galeri Dokumentasi & Rekam Jejak - Yayasan Payung Berkah",
    description: "Potret nyata amanah donatur dan kebaikan yang telah terlaksana.",
    images: ["/img/branding/logo-ypabe.webp"],
  },
};

export default async function GalleryPage() {
  const result = await getPublicGalleryItems({ limit: 48 });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      <PageHeader
        title="Galeri Dokumentasi & Rekam Jejak"
        description="Potret nyata penyaluran amanah, kegiatan sosial, dan kebersamaan bersama para penerima manfaat binaan Yayasan Payung Berkah."
      />

      <Suspense fallback={<GallerySkeleton count={9} showFilters />}>
        <GalleryCatalog
          initialItems={result.items}
          initialCategories={result.categories}
          initialHasMore={result.hasMore}
          initialTotal={result.total}
        />
      </Suspense>
    </main>
  );
}
